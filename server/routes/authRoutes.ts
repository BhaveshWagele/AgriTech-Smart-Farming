import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/database.ts';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.ts';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'agritech_smart_farming_jwt_secret_key_2026';

// Register Farmer / User
router.post('/register', (req, res) => {
  try {
    const { name, email, phone, password, role = 'Farmer', state, district, village, preferredLanguage = 'en' } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, and password are required fields.'
      });
    }

    const existingUser = db.users.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = db.users.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: hashedPassword,
      role: role === 'Admin' ? 'Admin' : role === 'Agricultural Expert' ? 'Agricultural Expert' : 'Farmer',
      state: state || 'Maharashtra',
      district: district || 'Nashik',
      village: village || 'Rural',
      preferredLanguage: preferredLanguage || 'en',
      avatarUrl: '/src/assets/images/avatar_farmer_1793370389630.jpg'
    });

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userObj = { ...newUser };
    delete userObj.password;

    return res.status(201).json({
      success: true,
      message: 'Account successfully registered.',
      token,
      user: userObj
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal server error during registration.'
    });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const user = db.users.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userObj = { ...user };
    delete userObj.password;

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: userObj
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal server error during login.'
    });
  }
});

// Current User Profile
router.get('/me', authenticate, (req: AuthenticatedRequest, res) => {
  const user = db.users.findById(req.user!._id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const userObj = { ...user };
  delete userObj.password;

  return res.json({
    success: true,
    user: userObj
  });
});

// Update Profile
router.put('/profile', authenticate, (req: AuthenticatedRequest, res) => {
  const { name, phone, state, district, village, preferredLanguage } = req.body;
  const updated = db.users.findByIdAndUpdate(req.user!._id, {
    name,
    phone,
    state,
    district,
    village,
    preferredLanguage
  });

  if (!updated) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const userObj = { ...updated };
  delete userObj.password;

  return res.json({
    success: true,
    message: 'Profile updated successfully',
    user: userObj
  });
});

export default router;
