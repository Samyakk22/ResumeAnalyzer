const PDFDocument = require('pdfkit');

/**
 * Generate a styled PDF report for an ATS analysis
 * @param {object} analysis - Full analysis document from MongoDB
 * @param {object} user - User document
 * @returns {Buffer} PDF buffer
 */
function generatePDFReport(analysis, user) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const PRIMARY = '#6366F1';
      const DARK = '#1e1b4b';
      const GRAY = '#6B7280';
      const GREEN = '#10B981';
      const RED = '#EF4444';
      const ORANGE = '#F59E0B';
      const PAGE_WIDTH = doc.page.width - 100;

      // ─── HEADER ───────────────────────────────────────────────
      doc.rect(0, 0, doc.page.width, 100).fill(PRIMARY);
      doc.fillColor('#FFFFFF').fontSize(24).font('Helvetica-Bold')
        .text('ResumeIQ ATS Report', 50, 30);
      doc.fontSize(11).font('Helvetica')
        .text(`Generated for: ${user.name}`, 50, 60)
        .text(`Date: ${new Date(analysis.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 50, 76);

      doc.moveDown(3);

      // ─── JOB TITLE ────────────────────────────────────────────
      doc.fillColor(DARK).fontSize(18).font('Helvetica-Bold')
        .text(`Position: ${analysis.jobTitle || 'Untitled Position'}`, 50, 120);

      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).strokeColor('#E5E7EB').stroke();
      doc.moveDown(0.5);

      // ─── ATS SCORE BOX ────────────────────────────────────────
      const scoreY = doc.y;
      const scoreStatus = getScoreStatus(analysis.atsScore);
      doc.rect(50, scoreY, PAGE_WIDTH, 80).fill('#F5F3FF').stroke();

      doc.fillColor(PRIMARY).fontSize(36).font('Helvetica-Bold')
        .text(`${analysis.atsScore}`, 70, scoreY + 15, { continued: true });
      doc.fillColor(GRAY).fontSize(14).font('Helvetica')
        .text('/100', { continued: false });

      doc.fillColor(DARK).fontSize(14).font('Helvetica-Bold')
        .text(`ATS Score — ${scoreStatus.label}`, 160, scoreY + 15);
      doc.fillColor(GRAY).fontSize(10).font('Helvetica')
        .text(scoreStatus.description, 160, scoreY + 35, { width: PAGE_WIDTH - 130 });

      doc.y = scoreY + 95;
      doc.moveDown(0.5);

      // ─── SUB SCORES ───────────────────────────────────────────
      doc.fillColor(DARK).fontSize(14).font('Helvetica-Bold').text('Score Breakdown');
      doc.moveDown(0.3);

      const subScores = [
        { label: 'Keyword Match', value: analysis.keywordMatch },
        { label: 'Format Quality', value: analysis.formatQuality },
        { label: 'Readability', value: analysis.readability },
        { label: 'Experience Match', value: analysis.experienceMatch },
      ];

      for (const item of subScores) {
        const barY = doc.y;
        doc.fillColor(DARK).fontSize(10).font('Helvetica').text(`${item.label}`, 50, barY);
        doc.fillColor(PRIMARY).fontSize(10).font('Helvetica-Bold').text(`${item.value}%`, PAGE_WIDTH - 10, barY, { align: 'right' });

        doc.y = barY + 14;
        doc.rect(50, doc.y, PAGE_WIDTH, 6).fill('#E5E7EB');
        doc.rect(50, doc.y, (PAGE_WIDTH * item.value) / 100, 6).fill(PRIMARY);
        doc.y += 16;
        doc.moveDown(0.3);
      }

      doc.moveDown(0.5);

      // ─── MATCHED SKILLS ───────────────────────────────────────
      if (analysis.matchedSkills && analysis.matchedSkills.length > 0) {
        doc.fillColor(DARK).fontSize(14).font('Helvetica-Bold').text('✓ Matched Skills');
        doc.moveDown(0.3);
        doc.fillColor(GREEN).fontSize(10).font('Helvetica')
          .text(analysis.matchedSkills.join('  •  '), { width: PAGE_WIDTH });
        doc.moveDown(0.8);
      }

      // ─── MISSING KEYWORDS ─────────────────────────────────────
      if (analysis.missingKeywords && analysis.missingKeywords.length > 0) {
        doc.fillColor(DARK).fontSize(14).font('Helvetica-Bold').text('✗ Missing Keywords');
        doc.moveDown(0.3);
        doc.fillColor(RED).fontSize(10).font('Helvetica')
          .text(analysis.missingKeywords.join('  •  '), { width: PAGE_WIDTH });
        doc.moveDown(0.8);
      }

      // ─── STRENGTHS ────────────────────────────────────────────
      if (analysis.strengths && analysis.strengths.length > 0) {
        doc.fillColor(DARK).fontSize(14).font('Helvetica-Bold').text('Resume Strengths');
        doc.moveDown(0.3);
        for (const strength of analysis.strengths) {
          doc.fillColor(DARK).fontSize(10).font('Helvetica').text(`▸  ${strength}`, { width: PAGE_WIDTH });
          doc.moveDown(0.2);
        }
        doc.moveDown(0.5);
      }

      // ─── IMPROVEMENTS ─────────────────────────────────────────
      if (analysis.improvements && analysis.improvements.length > 0) {
        doc.fillColor(DARK).fontSize(14).font('Helvetica-Bold').text('Areas for Improvement');
        doc.moveDown(0.3);
        for (const item of analysis.improvements) {
          doc.fillColor(ORANGE).fontSize(10).font('Helvetica').text(`▸  ${item}`, { width: PAGE_WIDTH });
          doc.moveDown(0.2);
        }
        doc.moveDown(0.5);
      }

      // ─── RECOMMENDATIONS ──────────────────────────────────────
      if (analysis.recommendations && analysis.recommendations.length > 0) {
        // New page if needed
        if (doc.y > 650) doc.addPage();

        doc.fillColor(DARK).fontSize(14).font('Helvetica-Bold').text('Recommendations');
        doc.moveDown(0.5);

        for (const rec of analysis.recommendations) {
          const impactColor = rec.impact === 'high' ? RED : rec.impact === 'medium' ? ORANGE : GREEN;
          doc.fillColor(DARK).fontSize(11).font('Helvetica-Bold').text(rec.title, { continued: true });
          doc.fillColor(impactColor).fontSize(9).font('Helvetica').text(`  [${rec.impact?.toUpperCase()} IMPACT]`);
          doc.fillColor(GRAY).fontSize(9).font('Helvetica')
            .text(rec.description, { width: PAGE_WIDTH, indent: 10 });
          doc.moveDown(0.5);
        }
      }

      // ─── FOOTER ───────────────────────────────────────────────
      const footerY = doc.page.height - 50;
      doc.moveTo(50, footerY - 10).lineTo(doc.page.width - 50, footerY - 10)
        .strokeColor('#E5E7EB').stroke();
      doc.fillColor(GRAY).fontSize(8).font('Helvetica')
        .text('Generated by ResumeIQ • ATS Resume Analyzer • resumeiq.app', 50, footerY, {
          align: 'center', width: PAGE_WIDTH,
        });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

function getScoreStatus(score) {
  if (score >= 90) return { label: 'Excellent', description: 'Your resume is highly optimized for ATS. Excellent chance of passing initial screening.' };
  if (score >= 75) return { label: 'Good', description: 'Your resume performs well. A few tweaks could make it even stronger.' };
  if (score >= 60) return { label: 'Average', description: 'Your resume meets basic requirements but needs improvement in key areas.' };
  return { label: 'Needs Improvement', description: 'Significant improvements needed. Follow the recommendations below to boost your score.' };
}

module.exports = { generatePDFReport };
