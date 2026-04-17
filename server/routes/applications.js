import express from 'express';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/applications
// @desc    Worker applies to a job
// @access  Private (worker)
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'worker') {
      return res.status(403).json({ message: 'Only workers can apply to jobs.' });
    }

    const { jobId } = req.body;

    // Verify job exists and is open
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }
    if (job.status !== 'Open') {
      return res.status(400).json({ message: 'This job is no longer accepting applications.' });
    }

    // Check for duplicate application
    const existing = await Application.findOne({ job: jobId, applicant: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You have already applied to this job.' });
    }

    const application = await Application.create({
      job: jobId,
      applicant: req.user._id,
    });

    // Populate job details before returning
    await application.populate('job', 'title budget location status');

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit application.' });
  }
});

// @route   GET /api/applications/mine
// @desc    Get current worker's applications with job details
// @access  Private (worker)
router.get('/mine', protect, async (req, res) => {
  try {
    if (req.user.role !== 'worker') {
      return res.status(403).json({ message: 'Only workers can view their applications.' });
    }

    const applications = await Application.find({ applicant: req.user._id })
      .populate('job', 'title budget location status providerName skillsRequired')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your applications.' });
  }
});

// @route   GET /api/applications/job/:jobId
// @desc    Provider views all applicants for their job
// @access  Private (provider — must own the job)
router.get('/job/:jobId', protect, async (req, res) => {
  try {
    // Verify the provider owns this job
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }
    if (job.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view applicants for this job.' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email skills location')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch applicants.' });
  }
});

// @route   GET /api/applications/provider/all
// @desc    Provider gets all applications for all their jobs
// @access  Private (provider)
router.get('/provider/all', protect, async (req, res) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({ message: 'Only providers can view applications for their jobs.' });
    }

    // Get all job IDs owned by this provider
    const providerJobs = await Job.find({ provider: req.user._id }).select('_id');
    const jobIds = providerJobs.map(j => j._id);

    const applications = await Application.find({ job: { $in: jobIds } })
      .populate('job', 'title budget location status')
      .populate('applicant', 'name email skills location')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch applications.' });
  }
});

// @route   PUT /api/applications/:id
// @desc    Provider accepts or rejects an application
// @access  Private (provider — must own the job)
router.put('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('job');
    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    // Verify provider owns this job
    if (application.job.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this application.' });
    }

    const { status } = req.body;
    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be "Accepted" or "Rejected".' });
    }

    application.status = status;
    await application.save();

    // Re-populate for response
    await application.populate('applicant', 'name email skills location');
    await application.populate('job', 'title budget location status');

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update application status.' });
  }
});

export default router;
