import express from 'express';
import { db } from '../db/database.ts';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.ts';

const router = express.Router();

// Get Expert Profiles
router.get('/experts', (req, res) => {
  const experts = db.experts.all();
  return res.json({ success: true, count: experts.length, data: experts });
});

// Get Consultations (Farmer sees own; Expert sees questions directed to them; Admin sees all)
router.get('/consultations', authenticate, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  let consultations = [];

  if (user.role === 'Admin') {
    consultations = db.consultations.all();
  } else if (user.role === 'Agricultural Expert') {
    const expert = db.experts.findOne({ contactEmail: user.email }) || db.experts.findById(user._id);
    if (expert) {
      consultations = db.consultations.find((c: any) => c.expertId === expert._id);
    } else {
      consultations = db.consultations.all();
    }
  } else {
    consultations = db.consultations.find((c: any) => c.farmerId === user._id);
  }

  return res.json({ success: true, count: consultations.length, data: consultations });
});

// Farmer Submit Consultation Question
router.post('/consultations', authenticate, (req: AuthenticatedRequest, res) => {
  try {
    const { expertId, subject, question, cropName, priority = 'Normal' } = req.body;

    if (!subject || !question) {
      return res.status(400).json({ success: false, message: 'Subject and question details are required.' });
    }

    const expert = expertId ? db.experts.findById(expertId) : db.experts.all()[0];
    const farmer = db.users.findById(req.user!._id);

    const newConsultation = db.consultations.create({
      farmerId: req.user!._id,
      farmerName: req.user!.name,
      farmerPhone: farmer ? farmer.phone : '',
      expertId: expert ? expert._id : 'exp_general',
      expertName: expert ? expert.name : 'Agricultural Advisory Board',
      subject,
      question,
      cropName: cropName || 'General Farm Inquiry',
      status: 'Pending',
      priority
    });

    // Notify farmer
    db.notifications.create({
      userId: req.user!._id,
      title: 'Consultation Submitted',
      message: `Your inquiry "${subject}" has been sent to ${expert ? expert.name : 'an Expert'}.`,
      type: 'consultation',
      read: false,
      link: '/consultation'
    });

    return res.status(201).json({
      success: true,
      message: 'Consultation request submitted successfully.',
      data: newConsultation
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Expert Respond to Consultation
router.put('/consultations/:id/respond', authenticate, (req: AuthenticatedRequest, res) => {
  const { answer } = req.body;
  if (!answer || answer.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Answer response cannot be empty.' });
  }

  const consultation = db.consultations.findById(req.params.id);
  if (!consultation) {
    return res.status(404).json({ success: false, message: 'Consultation not found' });
  }

  const updated = db.consultations.findByIdAndUpdate(req.params.id, {
    answer: answer.trim(),
    answeredAt: new Date().toISOString(),
    status: 'Answered'
  });

  // Notify farmer
  if (consultation.farmerId) {
    db.notifications.create({
      userId: consultation.farmerId,
      title: 'Expert Replied to Your Consultation',
      message: `${consultation.expertName} has provided an answer to "${consultation.subject}".`,
      type: 'consultation',
      read: false,
      link: '/consultation'
    });
  }

  return res.json({ success: true, message: 'Response submitted to farmer.', data: updated });
});

export default router;
