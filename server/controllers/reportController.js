const asyncHandler = require('express-async-handler');
const Report = require('../models/Report');

// @desc    Get all reports for user
// @route   GET /api/reports
// @access  Private
const getReports = asyncHandler(async (req, res) => {
  const { search } = req.query;
  let query = { userId: req.user._id };

  if (search) {
    query.jobTitle = { $regex: search, $options: 'i' };
  }

  const reports = await Report.find(query).sort({ createdAt: -1 });

  // Stats
  const total = reports.length;
  const avgScore = total > 0
    ? Math.round(reports.reduce((s, r) => s + (r.reportData?.atsScore || 0), 0) / total)
    : 0;
  const bestScore = total > 0
    ? Math.max(...reports.map((r) => r.reportData?.atsScore || 0))
    : 0;

  res.json({ success: true, count: total, stats: { total, avgScore, bestScore }, reports });
});

// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Private
const getReport = asyncHandler(async (req, res) => {
  const report = await Report.findOne({ _id: req.params.id, userId: req.user._id });
  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }
  res.json({ success: true, report });
});

// @desc    Download PDF report
// @route   GET /api/reports/:id/download
// @access  Private
const downloadReport = asyncHandler(async (req, res) => {
  const report = await Report.findOne({ _id: req.params.id, userId: req.user._id });
  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }
  res.status(410).json({ success: false, message: 'PDF download removed' });
});

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private
const deleteReport = asyncHandler(async (req, res) => {
  const report = await Report.findOne({ _id: req.params.id, userId: req.user._id });
  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }
  await report.deleteOne();
  // no-op: client should refresh stats after deletion
  res.json({ success: true, message: 'Report deleted successfully' });
});

module.exports = { getReports, getReport, downloadReport, deleteReport };
