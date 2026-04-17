import express from 'express';
import Review from '../models/Review.js';
import User from '../models/User.js';
import Application from '../models/Application.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/reviews
// @desc    Provider submits a review for a worker after job completion
// @access  Private (provider)
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({ message: 'Only providers can submit reviews.' });
    }

    const { workerId, jobId, rating, comment } = req.body;

    // Verify the application exists and is accepted
    const application = await Application.findOne({
      job: jobId,
      applicant: workerId,
      status: 'Accepted',
    });

    if (!application) {
      return res.status(400).json({ message: 'No accepted application found for this worker and job.' });
    }

    // Check for existing review
    const existingReview = await Review.findOne({ worker: workerId, reviewer: req.user._id });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this worker.' });
    }

    if (rating < 3 && (!comment || !comment.trim())) {
      return res.status(400).json({ message: 'Please provide a reason for ratings less than 3 stars.' });
    }

    const review = await Review.create({
      reviewer: req.user._id,
      worker: workerId,
      job: jobId,
      rating,
      comment: comment || '',
    });

    // Update worker's average rating
    const worker = await User.findById(workerId);
    const newCount = worker.ratingCount + 1;
    const newRating = ((worker.rating * worker.ratingCount) + rating) / newCount;
    worker.rating = Math.round(newRating * 10) / 10; // Round to 1 decimal
    worker.ratingCount = newCount;
    await worker.save();

    await review.populate('worker', 'name rating ratingCount');
    await review.populate('job', 'title');

    res.status(201).json(review);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Review already submitted for this worker.' });
    }
    res.status(500).json({ message: 'Failed to submit review.' });
  }
});

// @route   GET /api/reviews/worker/:workerId
// @desc    Get all reviews for a specific worker
// @access  Public
router.get('/worker/:workerId', async (req, res) => {
  try {
    const reviews = await Review.find({ worker: req.params.workerId })
      .populate('reviewer', 'name')
      .populate('job', 'title')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews.' });
  }
});

export default router;
