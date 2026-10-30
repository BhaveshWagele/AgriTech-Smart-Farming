import express from 'express';
import { db } from '../db/database.ts';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.ts';

const router = express.Router();

// Get all crops
router.get('/', authenticate, (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const { farmId, status, growthStage } = req.query;

    let crops = [];
    if (user.role === 'Admin') {
      crops = db.crops.all();
    } else {
      crops = db.crops.find((c: any) => c.userId === user._id);
    }

    if (farmId) {
      crops = crops.filter((c: any) => c.farmId === farmId);
    }
    if (status) {
      crops = crops.filter((c: any) => c.status === status);
    }
    if (growthStage) {
      crops = crops.filter((c: any) => c.growthStage === growthStage);
    }

    // Attach farm name to each crop
    const cropsWithFarm = crops.map((crop: any) => {
      const farm = db.farms.findById(crop.farmId);
      return {
        ...crop,
        farmName: farm ? farm.name : 'Unknown Farm',
        farmLocation: farm ? farm.location : ''
      };
    });

    return res.json({ success: true, count: cropsWithFarm.length, data: cropsWithFarm });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Get single crop
router.get('/:id', authenticate, (req: AuthenticatedRequest, res) => {
  const crop = db.crops.findById(req.params.id);
  if (!crop) {
    return res.status(404).json({ success: false, message: 'Crop not found' });
  }

  const farm = db.farms.findById(crop.farmId);
  const activities = db.farmActivities.find((a: any) => a.cropId === crop._id);
  const pestReports = db.pestReports.find((p: any) => p.cropName === crop.name);

  return res.json({
    success: true,
    data: {
      ...crop,
      farmName: farm ? farm.name : 'Unknown Farm',
      activities,
      pestReports
    }
  });
});

// Create new crop
router.post('/', authenticate, (req: AuthenticatedRequest, res) => {
  try {
    const {
      farmId,
      name,
      variety,
      plantingDate,
      expectedHarvestDate,
      cultivatedArea,
      areaUnit = 'acres',
      growthStage = 'Vegetative',
      irrigationSchedule,
      fertilizerInfo,
      status = 'Healthy',
      yieldEstimate = 0,
      yieldUnit = 'quintals',
      notes
    } = req.body;

    if (!farmId || !name || !plantingDate || !cultivatedArea) {
      return res.status(400).json({
        success: false,
        message: 'Farm selection, crop name, planting date, and cultivated area are required.'
      });
    }

    const farm = db.farms.findById(farmId);
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Specified farm does not exist.' });
    }

    const newCrop = db.crops.create({
      farmId,
      userId: req.user!._id,
      name: name.trim(),
      variety: variety || 'Standard Local Hybrid',
      plantingDate,
      expectedHarvestDate: expectedHarvestDate || '',
      cultivatedArea: Number(cultivatedArea),
      areaUnit,
      growthStage,
      irrigationSchedule: irrigationSchedule || 'Every 4-6 days as needed',
      fertilizerInfo: fertilizerInfo || 'NPK basal application',
      status,
      yieldEstimate: Number(yieldEstimate) || 0,
      yieldUnit,
      notes: notes || ''
    });

    // Create an initial farm activity
    db.farmActivities.create({
      farmId,
      farmName: farm.name,
      cropId: newCrop._id,
      cropName: newCrop.name,
      userId: req.user!._id,
      activityType: 'Weeding',
      date: plantingDate,
      notes: `Sowing of ${newCrop.name} (${newCrop.variety}) on ${newCrop.cultivatedArea} ${newCrop.areaUnit}.`,
      completed: true
    });

    // Notify farmer
    db.notifications.create({
      userId: req.user!._id,
      title: 'Crop Sown & Registered',
      message: `${newCrop.name} recorded on farm "${farm.name}". Expected harvest: ${expectedHarvestDate || 'TBD'}.`,
      type: 'crop',
      read: false,
      link: '/crops'
    });

    return res.status(201).json({ success: true, message: 'Crop registered successfully.', data: newCrop });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Update crop
router.put('/:id', authenticate, (req: AuthenticatedRequest, res) => {
  const crop = db.crops.findById(req.params.id);
  if (!crop) {
    return res.status(404).json({ success: false, message: 'Crop not found' });
  }

  if (crop.userId !== req.user!._id && req.user!.role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to update this crop.' });
  }

  const updated = db.crops.findByIdAndUpdate(req.params.id, {
    name: req.body.name || crop.name,
    variety: req.body.variety || crop.variety,
    plantingDate: req.body.plantingDate || crop.plantingDate,
    expectedHarvestDate: req.body.expectedHarvestDate !== undefined ? req.body.expectedHarvestDate : crop.expectedHarvestDate,
    cultivatedArea: req.body.cultivatedArea ? Number(req.body.cultivatedArea) : crop.cultivatedArea,
    areaUnit: req.body.areaUnit || crop.areaUnit,
    growthStage: req.body.growthStage || crop.growthStage,
    irrigationSchedule: req.body.irrigationSchedule || crop.irrigationSchedule,
    fertilizerInfo: req.body.fertilizerInfo || crop.fertilizerInfo,
    status: req.body.status || crop.status,
    yieldEstimate: req.body.yieldEstimate !== undefined ? Number(req.body.yieldEstimate) : crop.yieldEstimate,
    yieldUnit: req.body.yieldUnit || crop.yieldUnit,
    notes: req.body.notes !== undefined ? req.body.notes : crop.notes
  });

  return res.json({ success: true, message: 'Crop updated successfully.', data: updated });
});

// Delete crop
router.delete('/:id', authenticate, (req: AuthenticatedRequest, res) => {
  const crop = db.crops.findById(req.params.id);
  if (!crop) {
    return res.status(404).json({ success: false, message: 'Crop not found' });
  }

  if (crop.userId !== req.user!._id && req.user!.role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this crop.' });
  }

  db.crops.findByIdAndDelete(req.params.id);
  return res.json({ success: true, message: 'Crop deleted successfully.' });
});

// Log activity for crop
router.post('/:id/activities', authenticate, (req: AuthenticatedRequest, res) => {
  const crop = db.crops.findById(req.params.id);
  if (!crop) {
    return res.status(404).json({ success: false, message: 'Crop not found' });
  }

  const farm = db.farms.findById(crop.farmId);
  const { activityType, date, notes, completed = true } = req.body;

  const activity = db.farmActivities.create({
    farmId: crop.farmId,
    farmName: farm ? farm.name : 'Farm',
    cropId: crop._id,
    cropName: crop.name,
    userId: req.user!._id,
    activityType: activityType || 'Irrigation',
    date: date || new Date().toISOString().split('T')[0],
    notes: notes || 'Scheduled crop care activity performed.',
    completed
  });

  return res.status(201).json({ success: true, message: 'Activity logged successfully.', data: activity });
});

export default router;
