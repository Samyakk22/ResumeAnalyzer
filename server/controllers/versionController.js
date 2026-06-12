const asyncHandler = require('express-async-handler');
const ResumeVersion = require('../models/ResumeVersion');

// @desc    Get all resume versions for user
// @route   GET /api/versions
// @access  Private
const getVersions = asyncHandler(async (req, res) => {
  const versions = await ResumeVersion.find({ userId: req.user._id })
    .sort({ versionNumber: -1 })
    .populate('analysisId', 'matchedSkills missingKeywords jobTitle');

  const totalVersions = versions.length;
  const currentScore = totalVersions > 0 ? versions[0].atsScore : 0;
  const firstScore = totalVersions > 0 ? versions[totalVersions - 1].atsScore : 0;
  const totalImprovement = currentScore - firstScore;

  res.json({
    success: true,
    count: totalVersions,
    summary: { currentScore, firstScore, totalImprovement },
    versions,
  });
});

// @desc    Get single resume version
// @route   GET /api/versions/:id
// @access  Private
const getVersion = asyncHandler(async (req, res) => {
  const version = await ResumeVersion.findOne({
    _id: req.params.id,
    userId: req.user._id,
  }).populate('analysisId');

  if (!version) {
    res.status(404);
    throw new Error('Version not found');
  }

  res.json({ success: true, version });
});

module.exports = { getVersions, getVersion };
