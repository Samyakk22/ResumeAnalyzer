const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  title: String,
  description: String,
  impact: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
});

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    jobTitle: {
      type: String,
      default: 'Untitled Position',
      trim: true,
    },
    requestId: {
      type: String,
      index: true,
      sparse: true,
    },
    resumeFile: {
      originalName: { type: String, required: true },
      filename: { type: String, required: true },
      path: { type: String, required: true },
      size: { type: Number },
      mimetype: { type: String },
    },
    jobDescription: {
      type: String,
      required: [true, 'Job description is required'],
    },
    // Overall score
    atsScore: { type: Number, min: 0, max: 100, default: 0 },
    // Sub-scores
    keywordMatch: { type: Number, min: 0, max: 100, default: 0 },
    formatQuality: { type: Number, min: 0, max: 100, default: 0 },
    readability: { type: Number, min: 0, max: 100, default: 0 },
    experienceMatch: { type: Number, min: 0, max: 100, default: 0 },
    // Analysis results
    matchedSkills: [{ type: String }],
    missingKeywords: [{ type: String }],
    suggestedKeywords: [{ type: String }],
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    recommendations: [recommendationSchema],
    // Metadata
    resumeText: { type: String, select: false }, // stored but not returned by default
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
  },
  { timestamps: true }
);

  // Ensure (userId, requestId) uniqueness to prevent duplicate analyses
  analysisSchema.index({ userId: 1, requestId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Analysis', analysisSchema);
