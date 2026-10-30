import express from 'express';
import { db } from '../db/database.ts';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.ts';

const router = express.Router();

// Get all farms (Admin sees all; Farmer sees their own)
router.get('/', authenticate, (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    let farms = [];

    if (user.role === 'Admin') {
      farms = db.farms.all();
    } else {
      farms = db.farms.find((f: any) => f.userId === user._id);
    }

    // Attach active crop count to each farm
    const farmsWithStats = farms.map((farm: any) => {
      const crops = db.crops.find((c: any) => c.farmId === farm._id);
      return {
        ...farm,
        cropCount: crops.length,
        crops: crops.map((c: any) => ({ _id: c._id, name: c.name, growthStage: c.growthStage, status: c.status }))
      };
    });

    return res.json({ success: true, count: farmsWithStats.length, data: farmsWithStats });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Get single farm
router.get('/:id', authenticate, (req: AuthenticatedRequest, res) => {
  const farm = db.farms.findById(req.params.id);
  if (!farm) {
    return res.status(404).json({ success: false, message: 'Farm record not found' });
  }

  const crops = db.crops.find((c: any) => c.farmId === farm._id);
  const soilReports = db.soilReports.find((s: any) => s.farmId === farm._id);
  const activities = db.farmActivities.find((a: any) => a.farmId === farm._id);

  return res.json({
    success: true,
    data: {
      ...farm,
      crops,
      soilReports,
      activities
    }
  });
});

// Create new farm
router.post('/', authenticate, (req: AuthenticatedRequest, res) => {
  try {
    const { name, location, state, district, village, landArea, areaUnit = 'acres', soilType, irrigationMethod, description } = req.body;

    if (!name || !landArea || !soilType || !irrigationMethod) {
      return res.status(400).json({
        success: false,
        message: 'Farm name, land area, soil type, and irrigation method are required.'
      });
    }

    const newFarm = db.farms.create({
      userId: req.user!._id,
      name: name.trim(),
      location: location || `${village || district}, ${state || ''}`,
      state: state || 'Maharashtra',
      district: district || 'Nashik',
      village: village || '',
      landArea: Number(landArea),
      areaUnit,
      soilType,
      irrigationMethod,
      description: description || '',
      coordinates: { lat: 20.0, lng: 74.0 }
    });

    // Create a notification for the farmer
    db.notifications.create({
      userId: req.user!._id,
      title: 'Farm Added Successfully',
      message: `Your farm "${newFarm.name}" (${newFarm.landArea} ${newFarm.areaUnit}) has been registered in AgriTech.`,
      type: 'crop',
      read: false,
      link: '/farms'
    });

    return res.status(201).json({ success: true, message: 'Farm registered successfully.', data: newFarm });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Update farm
router.put('/:id', authenticate, (req: AuthenticatedRequest, res) => {
  const farm = db.farms.findById(req.params.id);
  if (!farm) {
    return res.status(404).json({ success: false, message: 'Farm not found' });
  }

  if (farm.userId !== req.user!._id && req.user!.role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to edit this farm.' });
  }

  const updated = db.farms.findByIdAndUpdate(req.params.id, {
    name: req.body.name || farm.name,
    location: req.body.location || farm.location,
    state: req.body.state || farm.state,
    district: req.body.district || farm.district,
    village: req.body.village !== undefined ? req.body.village : farm.village,
    landArea: req.body.landArea ? Number(req.body.landArea) : farm.landArea,
    areaUnit: req.body.areaUnit || farm.areaUnit,
    soilType: req.body.soilType || farm.soilType,
    irrigationMethod: req.body.irrigationMethod || farm.irrigationMethod,
    description: req.body.description !== undefined ? req.body.description : farm.description
  });

  return res.json({ success: true, message: 'Farm details updated successfully.', data: updated });
});

// Delete farm
router.delete('/:id', authenticate, (req: AuthenticatedRequest, res) => {
  const farm = db.farms.findById(req.params.id);
  if (!farm) {
    return res.status(404).json({ success: false, message: 'Farm not found' });
  }

  if (farm.userId !== req.user!._id && req.user!.role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this farm.' });
  }

  db.farms.findByIdAndDelete(req.params.id);
  return res.json({ success: true, message: 'Farm removed successfully.' });
});

export default router;
