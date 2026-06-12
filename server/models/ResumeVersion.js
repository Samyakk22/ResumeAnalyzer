const mongoose = require('mongoose');

const resumeVersionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    analysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Analysis',
      required: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    jobTitle: {
      type: String,
      default: 'Untitled Position',
    },
    atsScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    resumeFile: {
      originalName: String,
      filename: String,
      path: String,
      size: Number,
    },
    changes: [{ type: String }],
    matchedSkillsCount: { type: Number, default: 0 },
    missingKeywordsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ResumeVersion', resumeVersionSchema);
