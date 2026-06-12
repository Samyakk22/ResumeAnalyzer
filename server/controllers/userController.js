const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, currentRole, avatar } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, currentRole, avatar },
    { new: true, runValidators: true }
  );

  res.json({ success: true, user });
});

// @desc    Change password
// @route   PUT /api/users/password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide current and new password');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters');
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password updated successfully' });
});

// @desc    Update user settings
// @route   PUT /api/users/settings
// @access  Private
const updateSettings = asyncHandler(async (req, res) => {
  const { theme, notifications } = req.body;

  const updateData = {};
  if (theme) updateData['settings.theme'] = theme;
  if (notifications) updateData['settings.notifications'] = notifications;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updateData },
    { new: true }
  );

  res.json({ success: true, user });
});

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
const deleteAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user._id);
  // In production: also delete all user's analyses, reports, versions, and uploaded files
  res.json({ success: true, message: 'Account deleted successfully' });
});

// @desc    Get user stats for dashboard
// @route   GET /api/users/stats
// @access  Private
const getUserStats = asyncHandler(async (req, res) => {
  const Analysis = require('../models/Analysis');
  const ResumeVersion = require('../models/ResumeVersion');

  const analyses = await Analysis.find({ userId: req.user._id, status: 'completed' }).select('atsScore createdAt jobTitle');

  const totalAnalyses = analyses.length;
  const avgScore = totalAnalyses > 0
    ? Math.round(analyses.reduce((sum, a) => sum + a.atsScore, 0) / totalAnalyses)
    : 0;
  const highestScore = totalAnalyses > 0
    ? Math.max(...analyses.map((a) => a.atsScore))
    : 0;

  const uploadedResumes = await ResumeVersion.countDocuments({ userId: req.user._id });

  res.json({
    success: true,
    stats: { totalAnalyses, avgScore, highestScore, uploadedResumes },
    scoreHistory: analyses.map((a) => ({
      date: a.createdAt,
      score: a.atsScore,
      jobTitle: a.jobTitle,
    })),
  });
});

module.exports = { updateProfile, changePassword, updateSettings, deleteAccount, getUserStats };
