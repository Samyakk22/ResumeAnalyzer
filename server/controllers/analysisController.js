const asyncHandler = require('express-async-handler');
const path = require('path');
const Analysis = require('../models/Analysis');
const ResumeVersion = require('../models/ResumeVersion');
const Report = require('../models/Report');
const { extractResumeText } = require('../services/pdfParser');
const { analyzeResume } = require('../services/atsEngine');

// Helper: extract job title from description
function extractJobTitle(jobDescription) {
  const lines = jobDescription.split('\n').map((l) => l.trim()).filter(Boolean);
  const firstLine = lines[0] || '';
  if (firstLine.length < 100) return firstLine;
  const titleMatch = jobDescription.match(/(?:job title|position|role)[:\s]+([^\n]{3,80})/i);
  if (titleMatch) return titleMatch[1].trim();
  return firstLine.substring(0, 60);
}

// @desc    Create new analysis
// @route   POST /api/analyses
// @access  Private
const createAnalysis = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a resume file (PDF or DOCX)');
  }

  const { jobDescription, jobTitle } = req.body;
  const requestId = req.body.requestId;

  // If requestId provided, attempt to return existing Analysis (idempotency)
  if (requestId) {
    const existingAnalysis = await Analysis.findOne({ userId: req.user._id, requestId });
    if (existingAnalysis) {
      // Ensure a ResumeVersion exists for this analysis (if earlier run was partially completed)
      const existingVersion = await ResumeVersion.findOne({ analysisId: existingAnalysis._id });
      if (!existingVersion) {
        const versionCount = await ResumeVersion.countDocuments({ userId: req.user._id });
        try {
          await ResumeVersion.findOneAndUpdate(
            { analysisId: existingAnalysis._id },
            {
              $setOnInsert: {
                userId: req.user._id,
                analysisId: existingAnalysis._id,
                versionNumber: versionCount + 1,
                jobTitle: existingAnalysis.jobTitle,
                atsScore: existingAnalysis.atsScore,
                resumeFile: existingAnalysis.resumeFile,
                changes: existingAnalysis.improvements?.slice(0, 3) || [],
                matchedSkillsCount: existingAnalysis.matchedSkills?.length || 0,
                missingKeywordsCount: existingAnalysis.missingKeywords?.length || 0,
              },
            },
            { upsert: true }
          );
        } catch (err) {
          if (err && err.code !== 11000) throw err;
        }
      }
      // Ensure a Report exists for this analysis
      const existingReport = await Report.findOne({ analysisId: existingAnalysis._id });
      if (!existingReport) {
          try {
            await Report.findOneAndUpdate(
              { analysisId: existingAnalysis._id },
              {
                $setOnInsert: {
                  userId: req.user._id,
                  analysisId: existingAnalysis._id,
                  jobTitle: existingAnalysis.jobTitle,
                  reportData: {
                    atsScore: existingAnalysis.atsScore,
                    resumeFileName: existingAnalysis.resumeFile?.originalName || '',
                  },
                },
              },
              { upsert: true }
            );
          } catch (err) {
            if (err && err.code !== 11000) throw err;
          }
        }
      return res.status(200).json({ success: true, analysis: existingAnalysis });
    }
  }
  if (!jobDescription || jobDescription.trim().length < 50) {
    res.status(400);
    throw new Error('Please provide a valid job description (minimum 50 characters)');
  }

  const filePath = req.file.path;
  const finalJobTitle = jobTitle?.trim() || extractJobTitle(jobDescription);

  // Extract text from uploaded file
  let resumeText;
  try {
    resumeText = await extractResumeText(filePath, req.file.mimetype);
  } catch (err) {
    res.status(422);
    throw new Error(`Could not read resume: ${err.message}`);
  }

  if (!resumeText || resumeText.trim().length < 50) {
    res.status(422);
    throw new Error('Resume appears to be empty or unreadable. Please upload a text-based PDF.');
  }

  // Run ATS analysis
  const results = analyzeResume(resumeText, jobDescription);

  // Save analysis to DB
  const analysis = await Analysis.create({
    userId: req.user._id,
    jobTitle: finalJobTitle,
    requestId: requestId,
    resumeFile: {
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
    jobDescription,
    resumeText,
    status: 'completed',
    ...results,
  });

  // Create resume version entry with idempotency handled above via requestId
  if (requestId) {
    // If a version for this analysis already exists, avoid creating duplicates
    const existing = await ResumeVersion.findOne({ analysisId: analysis._id });
    if (!existing) {
      const versionCount = await ResumeVersion.countDocuments({ userId: req.user._id });
    try {
      await ResumeVersion.findOneAndUpdate(
        { analysisId: analysis._id },
        {
          $setOnInsert: {
            userId: req.user._id,
            analysisId: analysis._id,
            versionNumber: versionCount + 1,
            jobTitle: finalJobTitle,
            atsScore: results.atsScore,
            resumeFile: analysis.resumeFile,
            changes: results.improvements.slice(0, 3),
            matchedSkillsCount: results.matchedSkills.length,
            missingKeywordsCount: results.missingKeywords.length,
          },
        },
        { upsert: true }
      );
    } catch (err) {
      if (err && err.code !== 11000) throw err;
    }
    }
  } else {
    // Backwards compatible: create version (no requestId provided)
    const versionCount = await ResumeVersion.countDocuments({ userId: req.user._id });
    try {
      await ResumeVersion.findOneAndUpdate(
        { analysisId: analysis._id },
        {
          $setOnInsert: {
            userId: req.user._id,
            analysisId: analysis._id,
            versionNumber: versionCount + 1,
            jobTitle: finalJobTitle,
            atsScore: results.atsScore,
            resumeFile: analysis.resumeFile,
            changes: results.improvements.slice(0, 3),
            matchedSkillsCount: results.matchedSkills.length,
            missingKeywordsCount: results.missingKeywords.length,
          },
        },
        { upsert: true }
      );
    } catch (err) {
      if (err && err.code !== 11000) throw err;
    }
  }

  // Auto-create report
  try {
    await Report.findOneAndUpdate(
      { analysisId: analysis._id },
      {
        $setOnInsert: {
          userId: req.user._id,
          analysisId: analysis._id,
          jobTitle: finalJobTitle,
          reportData: {
            ...results,
            resumeFileName: req.file.originalname,
          },
        },
      },
      { upsert: true }
    );
  } catch (err) {
    if (err && err.code !== 11000) throw err;
  }


  res.status(201).json({ success: true, analysis });
});

// @desc    Get all analyses for current user
// @route   GET /api/analyses
// @access  Private
const getAnalyses = asyncHandler(async (req, res) => {
  const analyses = await Analysis.find({ userId: req.user._id, status: 'completed' })
    .select('-jobDescription -resumeText -recommendations')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: analyses.length, analyses });
});

// @desc    Get single analysis
// @route   GET /api/analyses/:id
// @access  Private
const getAnalysis = asyncHandler(async (req, res) => {
  const analysis = await Analysis.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!analysis) {
    res.status(404);
    throw new Error('Analysis not found');
  }

  res.json({ success: true, analysis });
});

// @desc    Delete analysis
// @route   DELETE /api/analyses/:id
// @access  Private
const deleteAnalysis = asyncHandler(async (req, res) => {
  const analysis = await Analysis.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!analysis) {
    res.status(404);
    throw new Error('Analysis not found');
  }

  await analysis.deleteOne();
  res.json({ success: true, message: 'Analysis deleted' });
});

module.exports = { createAnalysis, getAnalyses, getAnalysis, deleteAnalysis };
