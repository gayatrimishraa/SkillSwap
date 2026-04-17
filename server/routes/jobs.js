import express from 'express';
import Job from '../models/Job.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/jobs
// @desc    Get all open jobs (public — for job discovery page)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, budgetMin, skill, location } = req.query;
    const filter = { status: 'Open' };

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }
    if (budgetMin) {
      filter.budget = { $gte: Number(budgetMin) };
    }
    if (skill) {
      filter.skillsRequired = { $in: skill.split(',').map(s => s.trim().toLowerCase()) };
    }
    if (location) {
      filter.location = { $regex: new RegExp(`^${location.trim()}$`, 'i') };
    }

    const jobs = await Job.find(filter)
      .populate('provider', 'name email')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch jobs.' });
  }
});

// @route   GET /api/jobs/mine
// @desc    Get jobs posted by the logged-in provider
// @access  Private (provider)
router.get('/mine', protect, async (req, res) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({ message: 'Only providers can view their posted jobs.' });
    }

    const jobs = await Job.find({ provider: req.user._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your jobs.' });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get single job by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('provider', 'name email');
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch job.' });
  }
});

// @route   POST /api/jobs
// @desc    Create a new job posting
// @access  Private (provider)
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({ message: 'Only providers can post jobs.' });
    }

    const { title, description, skillsRequired, budget, location } = req.body;

    const job = await Job.create({
      title,
      description,
      provider: req.user._id,
      providerName: req.user.name,
      skillsRequired: skillsRequired || [],
      budget,
      location: location || '',
    });

    res.status(201).json(job);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Failed to create job.' });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update a job posting (status, details)
// @access  Private (owner provider)
router.put('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }
    if (job.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this job.' });
    }

    const { title, description, skillsRequired, budget, location, status } = req.body;
    if (title) job.title = title;
    if (description) job.description = description;
    if (skillsRequired) job.skillsRequired = skillsRequired;
    if (budget) job.budget = budget;
    if (location) job.location = location;
    if (status) job.status = status;

    const updated = await job.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update job.' });
  }
});

export default router;
