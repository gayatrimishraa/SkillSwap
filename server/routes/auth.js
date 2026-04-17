import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect, JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

// Helper: generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '7d' });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, skills, location } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // Create user (password hashed by pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'worker',
      skills: skills || [],
      location: location || '',
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
        location: user.location,
        phone: user.phone || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        profileComplete: user.profileComplete || false,
        rating: user.rating || 0,
        ratingCount: user.ratingCount || 0,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error during registration.', errorDetails: error.message || error.toString() });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Optionally check role matches
    if (role && user.role !== role) {
      return res.status(403).json({ 
        message: `This account is registered as "${user.role}". Please select the correct login destination.` 
      });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
        location: user.location,
        phone: user.phone || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        profileComplete: user.profileComplete || false,
        rating: user.rating || 0,
        ratingCount: user.ratingCount || 0,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile from token
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.json({
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      skills: req.user.skills,
      location: req.user.location,
      phone: req.user.phone || '',
      bio: req.user.bio || '',
      avatar: req.user.avatar || '',
      profileComplete: req.user.profileComplete || false,
      rating: req.user.rating || 0,
      ratingCount: req.user.ratingCount || 0,
    },
  });
});

// @route   PUT /api/auth/profile
// @desc    Update current user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, bio, avatar, skills, location } = req.body;

    const user = req.user;
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    if (skills) user.skills = skills;
    if (location !== undefined) user.location = location;
    user.profileComplete = true;

    await user.save();

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
        location: user.location,
        phone: user.phone,
        bio: user.bio,
        avatar: user.avatar,
        profileComplete: user.profileComplete,
        rating: user.rating,
        ratingCount: user.ratingCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile.' });
  }
});

export default router;
