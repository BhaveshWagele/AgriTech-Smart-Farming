import express from 'express';
import { db } from '../db/database.ts';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.ts';
import { analyzeCropDisease } from '../services/aiDiseaseService.ts';

const router = express.Router();

export const CROP_DISEASE_KNOWLEDGE_BASE = [
  {
    id: 'dis_001',
    diseaseName: 'Early Blight (Alternaria solani)',
    affectedCrops: ['Tomato', 'Potato', 'Eggplant'],
    category: 'Fungal Pathogen',
    symptoms: 'Small, circular brown or black spots on older lower leaves that enlarge with concentric target rings and chlorotic halos.',
    prevention: 'Drip irrigation to avoid leaf wetness, crop rotation away from solanaceous plants for 3 years, organic straw mulching.',
    chemicalTreatment: 'Mancozeb 75 WP (2g/L) or Copper Oxychloride 50 WP (2.5g/L) applied at first symptom appearance.',
    organicTreatment: 'Bacillus subtilis bio-fungicide spray or 5% Neem Seed Kernel Extract (NSKE) foliar drench.',
    severity: 'Moderate',
    imageUrl: '/src/assets/images/disease_leaf_blight_1793370391634.jpg'
  },
  {
    id: 'dis_002',
    diseaseName: 'Yellow / Stripe Rust (Puccinia striiformis)',
    affectedCrops: ['Wheat', 'Barley'],
    category: 'Airborne Fungal Rust',
    symptoms: 'Linear yellow pustules forming characteristic stripes along leaf veins; leaves wither prematurely during grain filling.',
    prevention: 'Sow certified resistant varieties (HD-2967, PBW-550, WH-1105); avoid delayed planting in humid river basins.',
    chemicalTreatment: 'Propiconazole 25 EC (Tilt) @ 1ml/L or Tebuconazole 25.9 EC @ 1ml/L.',
    organicTreatment: 'Cow urine extract with copper slurry applied during early seedling stage; garlic-chilli bio-extract.',
    severity: 'High',
    imageUrl: '/src/assets/images/crop_wheat_healthy_1793370391092.jpg'
  },
  {
    id: 'dis_003',
    diseaseName: 'Pink Bollworm (Pectinophora gossypiella)',
    affectedCrops: ['Cotton'],
    category: 'Insect Larval Pest',
    symptoms: 'Rosetted flowers, premature boll opening, damaged lint with stained brown spots, internal burrowing into developing seeds.',
    prevention: 'Install 8 pheromone traps per acre for ETL monitoring; plant non-Bt refuge crops around boundary rows.',
    chemicalTreatment: 'Spinetoram 11.7 SC @ 1ml/L or Chlorantraniliprole 18.5 SC @ 0.3ml/L at peak moth catches.',
    organicTreatment: 'Release of Trichogramma bactrae egg parasitoids @ 60,000/acre at weekly intervals.',
    severity: 'Severe',
    imageUrl: 'https://images.unsplash.com/photo-1594488583488-66df3b9b47e5?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'dis_004',
    diseaseName: 'Rice Blast (Magnaporthe oryzae)',
    affectedCrops: ['Rice / Paddy'],
    category: 'Fungal Blast',
    symptoms: 'Spindle-shaped or eye-shaped lesions on leaves with greyish-white centres and dark brown margins; collar and neck rot.',
    prevention: 'Avoid excessive nitrogen split dosing; maintain field sanitation; treat seeds with Carbendazim 2g/kg.',
    chemicalTreatment: 'Tricyclazole 75 WP @ 0.6g/L or Isoprothiolane 40 EC @ 1.5ml/L at early tillering and panicle emergence.',
    organicTreatment: 'Pseudomonas fluorescens seed and foliar treatment @ 10g/L.',
    severity: 'Severe',
    imageUrl: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'dis_005',
    diseaseName: 'Red Rot of Sugarcane (Colletotrichum falcatum)',
    affectedCrops: ['Sugarcane'],
    category: 'Vascular Fungal Infection',
    symptoms: 'Discoloration of third or fourth leaf from top; longitudinal splitting reveals reddened internal pith with white transverse patches.',
    prevention: 'Plant disease-free sets treated with hot water at 52°C for 30 minutes; practice crop rotation with paddy or pulses.',
    chemicalTreatment: 'Set treatment with Carbendazim 50 WP (1g/L) prior to furrow planting.',
    organicTreatment: 'Sett dip in Trichoderma viride enriched slurry before laying in furrows.',
    severity: 'High',
    imageUrl: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80'
  }
];

// Get Disease Knowledge Base
router.get('/knowledge-base', (req, res) => {
  return res.json({
    success: true,
    count: CROP_DISEASE_KNOWLEDGE_BASE.length,
    data: CROP_DISEASE_KNOWLEDGE_BASE
  });
});

// Run AI Disease Diagnostic Check
router.post('/diagnose-ai', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { cropName, symptoms, imageBase64 } = req.body;

    if (!cropName || !symptoms) {
      return res.status(400).json({
        success: false,
        message: 'Crop name and observed symptoms are required for diagnostic evaluation.'
      });
    }

    const diagnosis = await analyzeCropDisease(cropName, symptoms, imageBase64);

    return res.json({
      success: true,
      message: 'AI Diagnostic Analysis complete.',
      data: diagnosis
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Get Pest & Disease Reports
router.get('/reports', authenticate, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  let reports = [];

  if (user.role === 'Admin' || user.role === 'Agricultural Expert') {
    reports = db.pestReports.all();
  } else {
    reports = db.pestReports.find((r: any) => r.userId === user._id);
  }

  return res.json({ success: true, count: reports.length, data: reports });
});

// Submit a new Pest Report
router.post('/reports', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const {
      farmId,
      cropName,
      diseaseName,
      severity = 'Moderate',
      symptoms,
      location,
      imageUrl,
      runAiCheck = true
    } = req.body;

    if (!cropName || !symptoms) {
      return res.status(400).json({
        success: false,
        message: 'Crop name and symptom description are required.'
      });
    }

    const farm = farmId ? db.farms.findById(farmId) : null;
    let aiDiagnosis = null;

    if (runAiCheck) {
      aiDiagnosis = await analyzeCropDisease(cropName, symptoms, imageUrl);
    }

    const newReport = db.pestReports.create({
      userId: req.user!._id,
      farmerName: req.user!.name,
      farmId: farmId || '',
      farmName: farm ? farm.name : 'Registered Farm',
      cropName,
      diseaseName: diseaseName || (aiDiagnosis ? aiDiagnosis.identifiedDisease : 'Under Evaluation'),
      severity: aiDiagnosis ? aiDiagnosis.severity : severity,
      symptoms,
      location: location || (farm ? `${farm.village}, ${farm.district}` : 'Field plot'),
      imageUrl: imageUrl || '/src/assets/images/disease_leaf_blight_1793370391634.jpg',
      status: 'Pending Review',
      aiDiagnosis: aiDiagnosis || undefined
    });

    // Notify user
    db.notifications.create({
      userId: req.user!._id,
      title: 'Pest Report Submitted',
      message: `Your report for ${cropName} (${newReport.diseaseName}) has been logged and assigned to agronomists.`,
      type: 'pest',
      read: false,
      link: '/pest-alerts'
    });

    return res.status(201).json({
      success: true,
      message: 'Pest and disease report submitted successfully.',
      data: newReport
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Update Report status (Admin / Expert)
router.put('/reports/:id', authenticate, (req: AuthenticatedRequest, res) => {
  const { status, expertNotes } = req.body;
  const report = db.pestReports.findById(req.params.id);

  if (!report) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  const updated = db.pestReports.findByIdAndUpdate(req.params.id, {
    status: status || report.status,
    expertNotes: expertNotes !== undefined ? expertNotes : report.expertNotes
  });

  if (expertNotes && report.userId) {
    db.notifications.create({
      userId: report.userId,
      title: 'Expert Reviewed Your Pest Report',
      message: `An agricultural expert has reviewed your ${report.cropName} disease submission.`,
      type: 'pest',
      read: false,
      link: '/pest-alerts'
    });
  }

  return res.json({ success: true, message: 'Pest report updated.', data: updated });
});

export default router;
