import express from 'express';
import { db } from '../db/database.ts';
import { authenticate, AuthenticatedRequest, authorizeRoles } from '../middleware/auth.ts';

const router = express.Router();

// Platform Overview Statistics
router.get('/stats', authenticate, authorizeRoles('Admin'), (req, res) => {
  try {
    const users = db.users.all();
    const farms = db.farms.all();
    const crops = db.crops.all();
    const orders = db.orders.all();
    const pestReports = db.pestReports.all();
    const consultations = db.consultations.all();
    const products = db.products.all();

    const totalLand = farms.reduce((acc: number, f: any) => acc + (Number(f.landArea) || 0), 0);
    const totalRevenue = orders.reduce((acc: number, o: any) => acc + (Number(o.totalAmount) || 0), 0);

    return res.json({
      success: true,
      data: {
        totalFarmers: users.filter((u: any) => u.role === 'Farmer').length,
        totalExperts: users.filter((u: any) => u.role === 'Agricultural Expert').length,
        totalAdmins: users.filter((u: any) => u.role === 'Admin').length,
        totalUsers: users.length,
        totalFarms: farms.length,
        totalCultivatedLandAcres: Math.round(totalLand * 10) / 10,
        activeCrops: crops.length,
        totalOrders: orders.length,
        totalRevenue,
        pendingPestReports: pestReports.filter((p: any) => p.status === 'Pending Review' || p.status === 'Investigating').length,
        pendingConsultations: consultations.filter((c: any) => c.status === 'Pending').length,
        totalProducts: products.length
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// View All Users
router.get('/users', authenticate, authorizeRoles('Admin'), (req, res) => {
  const users = db.users.all().map((u: any) => {
    const userObj = { ...u };
    delete userObj.password;
    return userObj;
  });
  return res.json({ success: true, count: users.length, data: users });
});

// Update User Role
router.put('/users/:id/role', authenticate, authorizeRoles('Admin'), (req, res) => {
  const { role } = req.body;
  if (!['Farmer', 'Admin', 'Agricultural Expert'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role specified.' });
  }

  const user = db.users.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const updated = db.users.findByIdAndUpdate(req.params.id, { role });
  const userObj = { ...updated };
  delete userObj.password;

  return res.json({ success: true, message: 'User role updated.', data: userObj });
});

// Delete User
router.delete('/users/:id', authenticate, authorizeRoles('Admin'), (req: AuthenticatedRequest, res) => {
  if (req.params.id === req.user!._id) {
    return res.status(400).json({ success: false, message: 'Cannot delete your own admin account.' });
  }

  const user = db.users.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  db.users.findByIdAndDelete(req.params.id);
  return res.json({ success: true, message: 'User account removed.' });
});

export default router;
