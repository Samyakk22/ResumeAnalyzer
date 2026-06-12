const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
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
    jobTitle: {
      type: String,
      default: 'Untitled Position',
    },
    // Snapshot of analysis data at report creation time
    reportData: {
      atsScore: Number,
      keywordMatch: Number,
      formatQuality: Number,
      readability: Number,
      experienceMatch: Number,
      matchedSkills: [String],
      missingKeywords: [String],
      suggestedKeywords: [String],
      strengths: [String],
      improvements: [String],
      recommendations: [
        {
          title: String,
          description: String,
          impact: String,
        },
      ],
      resumeFileName: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
