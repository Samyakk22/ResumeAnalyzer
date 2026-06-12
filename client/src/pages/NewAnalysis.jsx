import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import {
  Upload, FileText, X, CheckCircle2, AlertCircle,
  Lightbulb, ChevronRight, Zap,
} from 'lucide-react';
import { analysisService } from '../services/analysisService';
import { formatFileSize } from '../utils/formatters';
import toast from 'react-hot-toast';

const RESUME_TIPS = [
  'Use a clean, single-column layout for better ATS parsing',
  'Include all keywords from the job description naturally',
  'Use standard section headers: Experience, Education, Skills',
  'Avoid tables, columns, and graphics — they confuse ATS',
  'Quantify achievements with specific numbers and metrics',
  'Use common file formats: PDF preferred, DOCX acceptable',
];

const JD_TIPS = [
  'Paste the complete job description for best results',
  'Include the required skills and qualifications section',
  'More detail = more accurate keyword matching',
];

export default function NewAnalysis() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [fileError, setFileError] = useState('');

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setFileError('');
    if (rejectedFiles.length > 0) {
      const err = rejectedFiles[0].errors[0];
      if (err.code === 'file-too-large') setFileError('File exceeds 5MB limit');
      else setFileError('Only PDF and DOCX files are accepted');
      return;
    }
    if (acceptedFiles[0]) setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  });

  const handleAnalyze = async () => {
    if (!file) { toast.error('Please upload a resume file'); return; }
    if (!jobDescription.trim() || jobDescription.trim().length < 50) {
      toast.error('Please enter a job description (minimum 50 characters)');
      return;
    }

    setAnalyzing(true);
    try {
      // Navigate to processing screen, carry the in-progress state
      navigate('/analysis/processing', {
        state: { file, jobDescription, jobTitle },
      });
    } catch {
      setAnalyzing(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">New Analysis</h1>
        <p className="page-subtitle">Upload your resume and paste the job description to get your ATS score</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Resume Upload */}
        <div className="space-y-4">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <Upload size={16} className="text-indigo-600" />
              </div>
              <h2 className="font-bold text-gray-900 dark:text-white">Resume Upload</h2>
            </div>

            {/* Dropzone */}
            {!file ? (
              <div
                {...getRootProps()}
                id="resume-dropzone"
                className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
                  isDragActive
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-[1.02]'
                    : 'border-gray-200 dark:border-gray-700 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10'
                }`}
              >
                <input {...getInputProps()} />
                <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-colors ${
                  isDragActive ? 'bg-indigo-100 dark:bg-indigo-900/40' : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  <Upload size={28} className={isDragActive ? 'text-indigo-600' : 'text-gray-400'} />
                </div>
                {isDragActive ? (
                  <p className="text-indigo-600 font-semibold">Drop your resume here!</p>
                ) : (
                  <>
                    <p className="font-semibold text-gray-900 dark:text-white">Drag & drop your resume</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">or click to browse files</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                      PDF or DOCX • Max 5MB
                    </p>
                  </>
                )}
              </div>
            ) : (
              /* File Preview */
              <div className="border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shadow-sm">
                    <FileText size={22} className="text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{file.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatFileSize(file.size)}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Ready to analyze</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-emerald-500" />
                    <button
                      onClick={() => setFile(null)}
                      id="remove-file-btn"
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X size={16} className="text-gray-400" />
                    </button>
                  </div>
                </div>
                {/* Re-upload option */}
                <div {...getRootProps()} className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800">
                  <input {...getInputProps()} />
                  <button type="button" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                    Upload a different file
                  </button>
                </div>
              </div>
            )}

            {/* File error */}
            {fileError && (
              <div className="flex items-center gap-2 mt-3 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle size={16} />
                {fileError}
              </div>
            )}

            {/* Job Title */}
            <div className="mt-5">
              <label htmlFor="job-title-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Job Title <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="job-title-input"
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="input-field"
                placeholder="e.g. Senior Software Engineer at Google"
              />
            </div>
          </div>

          {/* Resume Tips */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={16} className="text-amber-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Resume Tips for Better ATS Score</h3>
            </div>
            <ul className="space-y-2">
              {RESUME_TIPS.map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <ChevronRight size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Job Description */}
        <div className="space-y-4">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <FileText size={16} className="text-purple-600" />
              </div>
              <h2 className="font-bold text-gray-900 dark:text-white">Job Description</h2>
            </div>

            <div className="relative">
              <textarea
                id="job-description-input"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={16}
                className="input-field resize-none text-sm leading-relaxed"
                placeholder="Paste the complete job description here...

Include:
• Job title and company
• Required skills and technologies
• Responsibilities
• Qualifications and experience required"
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {jobDescription.length} chars
                {jobDescription.length < 50 && jobDescription.length > 0 && (
                  <span className="text-amber-500 ml-1">({50 - jobDescription.length} more needed)</span>
                )}
              </div>
            </div>
          </div>

          {/* JD Tips */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={16} className="text-purple-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Job Description Tips</h3>
            </div>
            <ul className="space-y-2">
              {JD_TIPS.map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <ChevronRight size={14} className="text-purple-400 shrink-0 mt-0.5" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Analyze Button */}
      <div className="mt-8 flex justify-center">
        <button
          id="analyze-resume-btn"
          onClick={handleAnalyze}
          disabled={!file || jobDescription.trim().length < 50 || analyzing}
          className={`btn-primary text-base px-12 py-4 shadow-indigo disabled:shadow-none ${
            !file || jobDescription.trim().length < 50 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
          } transition-all duration-200`}
        >
          {analyzing ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Zap size={20} />
              Analyze Resume
            </>
          )}
        </button>
      </div>
      <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3">
        Analysis typically takes 3-10 seconds
      </p>
    </div>
  );
}
