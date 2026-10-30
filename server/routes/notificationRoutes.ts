import express from 'express';
import { db } from '../db/database.ts';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.ts';

const router = express.Router();

// Get Notifications for Current User
router.get('/', authenticate, (req: AuthenticatedRequest, res) => {
  const notifications = db.notifications.find((n: any) => n.userId === req.user!._id);
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  return res.json({
    success: true,
    unreadCount,
    count: notifications.length,
    data: notifications
  });
});

// Mark single notification as read
router.put('/:id/read', authenticate, (req: AuthenticatedRequest, res) => {
  const notif = db.notifications.findById(req.params.id);
  if (!notif) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }

  const updated = db.notifications.findByIdAndUpdate(req.params.id, { read: true });
  return res.json({ success: true, data: updated });
});

// Mark all as read
router.put('/mark-all-read', authenticate, (req: AuthenticatedRequest, res) => {
  const userNotifs = db.notifications.find((n: any) => n.userId === req.user!._id);
  userNotifs.forEach((n: any) => {
    db.notifications.findByIdAndUpdate(n._id, { read: true });
  });

  return res.json({ success: true, message: 'All notifications marked as read.' });
});

// Delete notification
router.delete('/:id', authenticate, (req: AuthenticatedRequest, res) => {
  db.notifications.findByIdAndDelete(req.params.id);
  return res.json({ success: true, message: 'Notification removed.' });
});

export default router;
