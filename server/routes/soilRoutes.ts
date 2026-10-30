import express from 'express';
import { db } from '../db/database.ts';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.ts';

const router = express.Router();

export interface SoilAnalysisInput {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  moisture: number;
  temperature: number;
  soilType: string;
}

export function evaluateSoilHealth(input: SoilAnalysisInput) {
  const { nitrogen, phosphorus, potassium, ph, moisture } = input;

  // Nutrient evaluation
  let nStatus: 'Low' | 'Optimal' | 'High' = 'Optimal';
  if (nitrogen < 200) nStatus = 'Low';
  else if (nitrogen > 380) nStatus = 'High';

  let pStatus: 'Low' | 'Optimal' | 'High' = 'Optimal';
  if (phosphorus < 20) pStatus = 'Low';
  else if (phosphorus > 55) pStatus = 'High';

  let kStatus: 'Low' | 'Optimal' | 'High' = 'Optimal';
  if (potassium < 140) kStatus = 'Low';
  else if (potassium > 320) kStatus = 'High';

  // pH evaluation
  let phStatus: 'Acidic' | 'Neutral' | 'Alkaline' = 'Neutral';
  if (ph < 6.0) phStatus = 'Acidic';
  else if (ph > 7.6) phStatus = 'Alkaline';

  // Moisture evaluation
  let moistureStatus: 'Deficient' | 'Adequate' | 'Excessive' = 'Adequate';
  if (moisture < 25) moistureStatus = 'Deficient';
  else if (moisture > 45) moistureStatus = 'Excessive';

  // Health Score Calculation (0 - 100)
  let score = 70;
  if (nStatus === 'Optimal') score += 8;
  else if (nStatus === 'Low') score -= 10;

  if (pStatus === 'Optimal') score += 7;
  else if (pStatus === 'Low') score -= 8;

  if (kStatus === 'Optimal') score += 7;
  else if (kStatus === 'Low') score -= 7;

  if (phStatus === 'Neutral') score += 8;
  else score -= 12;

  if (moistureStatus === 'Adequate') score += 10;
  else if (moistureStatus === 'Deficient') score -= 12;
  else score -= 8;

  score = Math.max(30, Math.min(98, score));

  // Recommendation engine
  const recommendations: string[] = [];

  if (nStatus === 'Low') {
    recommendations.push('Incorporate leguminous green manure (sunn hemp/dhaincha) or apply Neem-Coated Urea in split doses.');
  } else if (nStatus === 'High') {
    recommendations.push('Reduce chemical nitrogen application by 20% to prevent excessive vegetative growth and lodging.');
  }

  if (pStatus === 'Low') {
    recommendations.push('Apply Single Super Phosphate (SSP) or Phosphate Solubilizing Bacteria (PSB) bio-fertilizer.');
  }

  if (kStatus === 'Low') {
    recommendations.push('Apply Muriate of Potash (MOP) to enhance pest resilience and grain firmness.');
  }

  if (phStatus === 'Acidic') {
    recommendations.push('Apply agricultural lime (calcium carbonate) at 2-3 tons/ha to neutralize soil acidity and unlock phosphorus.');
  } else if (phStatus === 'Alkaline') {
    recommendations.push('Apply agricultural gypsum (calcium sulfate) and increase organic mulching to lower exchangeable sodium.');
  }

  if (moistureStatus === 'Deficient') {
    recommendations.push('Soil moisture is critically low. Initiate immediate drip or sprinkler cycle; incorporate organic mulching.');
  } else if (moistureStatus === 'Excessive') {
    recommendations.push('Ensure field drainage furrows are cleared to avert root rot and nitrogen leaching.');
  }

  recommendations.push('Apply well-decomposed vermicompost at 2 tons/acre to sustain soil microbial biomass.');

  // Suitable Crops Matrix based on pH, texture, and nutrient balance
  let suitableCrops: string[] = [];
  if (ph < 6.5) {
    suitableCrops = ['Tea', 'Potato', 'Rice', 'Sweet Potato', 'Rye'];
  } else if (ph > 7.5) {
    suitableCrops = ['Cotton', 'Barley', 'Sugarbeet', 'Mustard', 'Spinach'];
  } else {
    suitableCrops = ['Wheat', 'Maize', 'Soybean', 'Chickpea', 'Tomato', 'Sugarcane', 'Cotton'];
  }

  return {
    healthScore: score,
    nutrientStatus: {
      nitrogenStatus: nStatus,
      phosphorusStatus: pStatus,
      potassiumStatus: kStatus
    },
    phStatus,
    moistureStatus,
    recommendations,
    suitableCrops
  };
}

// Get all soil reports
router.get('/', authenticate, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  let reports = [];

  if (user.role === 'Admin') {
    reports = db.soilReports.all();
  } else {
    reports = db.soilReports.find((s: any) => s.userId === user._id);
  }

  return res.json({ success: true, count: reports.length, data: reports });
});

// Run live analysis test
router.post('/analyze', authenticate, (req: AuthenticatedRequest, res) => {
  try {
    const { nitrogen, phosphorus, potassium, ph, moisture, temperature, soilType } = req.body;

    if (nitrogen === undefined || phosphorus === undefined || potassium === undefined || ph === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Nitrogen, Phosphorus, Potassium, and pH values are required.'
      });
    }

    const evaluation = evaluateSoilHealth({
      nitrogen: Number(nitrogen),
      phosphorus: Number(phosphorus),
      potassium: Number(potassium),
      ph: Number(ph),
      moisture: Number(moisture || 30),
      temperature: Number(temperature || 25),
      soilType: soilType || 'Alluvial'
    });

    return res.json({
      success: true,
      message: 'Soil analysis calculated successfully',
      data: {
        ...req.body,
        ...evaluation,
        disclaimer: 'Indicative agricultural advisory guidance only. Not a laboratory-certified test.'
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Save soil test report
router.post('/', authenticate, (req: AuthenticatedRequest, res) => {
  try {
    const { farmId, nitrogen, phosphorus, potassium, ph, moisture, temperature, soilType, notes } = req.body;

    if (!farmId || nitrogen === undefined || phosphorus === undefined || potassium === undefined || ph === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Farm selection and soil nutrient metrics (N, P, K, pH) are required.'
      });
    }

    const farm = db.farms.findById(farmId);
    const farmName = farm ? farm.name : 'Primary Farm';

    const evaluation = evaluateSoilHealth({
      nitrogen: Number(nitrogen),
      phosphorus: Number(phosphorus),
      potassium: Number(potassium),
      ph: Number(ph),
      moisture: Number(moisture || 30),
      temperature: Number(temperature || 25),
      soilType: soilType || (farm ? farm.soilType : 'Alluvial')
    });

    const newReport = db.soilReports.create({
      farmId,
      userId: req.user!._id,
      farmName,
      nitrogen: Number(nitrogen),
      phosphorus: Number(phosphorus),
      potassium: Number(potassium),
      ph: Number(ph),
      moisture: Number(moisture || 30),
      temperature: Number(temperature || 25),
      soilType: soilType || (farm ? farm.soilType : 'Alluvial'),
      healthScore: evaluation.healthScore,
      nutrientStatus: evaluation.nutrientStatus,
      phStatus: evaluation.phStatus,
      moistureStatus: evaluation.moistureStatus,
      recommendations: evaluation.recommendations,
      suitableCrops: evaluation.suitableCrops,
      notes: notes || 'Standard seasonal soil health audit.'
    });

    // Create an activity entry
    db.farmActivities.create({
      farmId,
      farmName,
      userId: req.user!._id,
      activityType: 'Soil Testing',
      date: new Date().toISOString().split('T')[0],
      notes: `Soil Health Audit logged: Score ${evaluation.healthScore}/100. pH ${ph}.`,
      completed: true
    });

    return res.status(201).json({
      success: true,
      message: 'Soil report saved successfully.',
      data: newReport
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Delete soil report
router.delete('/:id', authenticate, (req: AuthenticatedRequest, res) => {
  const report = db.soilReports.findById(req.params.id);
  if (!report) {
    return res.status(404).json({ success: false, message: 'Soil report not found' });
  }

  if (report.userId !== req.user!._id && req.user!.role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this report.' });
  }

  db.soilReports.findByIdAndDelete(req.params.id);
  return res.json({ success: true, message: 'Soil report removed.' });
});

export default router;
