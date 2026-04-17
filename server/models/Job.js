import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  providerName: {
    type: String,
    default: '',
  },
  skillsRequired: {
    type: [String],
    default: [],
  },
  budget: {
    type: Number,
    required: [true, 'Budget is required'],
    min: 0,
  },
  location: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Completed'],
    default: 'Open',
  },
}, {
  timestamps: true,
});

const Job = mongoose.model('Job', jobSchema);
export default Job;
