const fs = require('fs');
const path = require('path');

// pdf-parse has a CJS/ESM interop issue in newer versions —
// the module may export { default: fn } instead of fn directly.
// We resolve this once at module load time.
let _pdfParse = null;
function getPdfParse() {
  if (_pdfParse) return _pdfParse;
  const mod = require('pdf-parse');
  // Handle both { default: fn } and fn-direct exports
  _pdfParse = typeof mod === 'function' ? mod : (mod.default || mod);
  if (typeof _pdfParse !== 'function') {
    throw new Error('pdf-parse module did not export a callable function');
  }
  return _pdfParse;
}

/**
 * Extract text from PDF file using pdf-parse
 */
async function extractFromPDF(filePath) {
  try {
    const pdfParse = getPdfParse();
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text || '';
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}

/**
 * Extract text from DOCX file using mammoth
 */
async function extractFromDOCX(filePath) {
  try {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || '';
  } catch (error) {
    throw new Error(`Failed to parse DOCX: ${error.message}`);
  }
}

/**
 * Extract text from uploaded resume file
 * Supports PDF and DOCX formats
 * @param {string} filePath - Absolute path to uploaded file
 * @param {string} mimetype - MIME type of the file
 * @returns {string} Extracted plain text
 */
async function extractResumeText(filePath, mimetype) {
  const ext = path.extname(filePath).toLowerCase();

  if (mimetype === 'application/pdf' || ext === '.pdf') {
    return await extractFromPDF(filePath);
  } else if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword' ||
    ext === '.docx' ||
    ext === '.doc'
  ) {
    return await extractFromDOCX(filePath);
  } else {
    throw new Error('Unsupported file format. Please upload PDF or DOCX.');
  }
}

module.exports = { extractResumeText };
