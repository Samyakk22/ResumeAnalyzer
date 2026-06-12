import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Download, PlusCircle, CheckCircle2, XCircle,
  Lightbulb, TrendingUp, TrendingDown, ChevronDown, ChevronUp,
  BarChart3, Zap, FileText, Star,
} from 'lucide-react';
import { analysisService } from '../services/analysisService';
import { reportService } from '../services/reportService';
import { getScoreStatus, getScoreStrokeColor, getCircleDashOffset, getImpactColor, getScoreBarColor } from '../utils/scoreHelpers';
import { formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

function ScoreCircle({ score }) {
  const circumference = 283;
  const offset = getCircleDashOffset(score, circumference);
  const strokeColor = getScoreStrokeColor(score);
  const status = getScoreStatus(score);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg className="w-40 h-40 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6"
            className="text-gray-100 dark:text-gray-800" />
          <circle
            cx="50" cy="50" r="45" fill="none"
            stroke={strokeColor} strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black" style={{ color: strokeColor }}>{score}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">/ 100</span>
        </div>
      </div>
      <div className={`mt-3 px-4 py-1.5 rounded-full text-sm font-bold border ${status.bg} ${status.color} ${status.border}`}>
        {status.label}
      </div>
    </div>
  );
}

function MetricBar({ label, value, description }) {
  const color = getScoreBarColor(value);
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-sm font-bold text-gray-900 dark:text-white">{value}%</span>
      </div>
      <div className="score-bar">
        <div
          className={`score-bar-fill ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      {description && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{description}</p>}
    </div>
  );
}

function BadgeList({ items, variant, emptyText }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? items : items.slice(0, 12);

  if (!items || items.length === 0) {
    return <p className="text-sm text-gray-400 dark:text-gray-500 italic">{emptyText}</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {visible.map((item) => (
          <span key={item} className={`badge-${variant}`}>{item}</span>
        ))}
      </div>
      {items.length > 12 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
        >
          {showAll ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Show {items.length - 12} more</>}
        </button>
      )}
    </div>
  );
}

export default function Results() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const { analysis } = await analysisService.getById(id);
        setAnalysis(analysis);
      } catch (err) {
        toast.error('Could not load analysis results');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [id]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Get the report ID for this analysis
      const reportsData = await reportService.getAll();
      const report = reportsData.reports?.find((r) => r.analysisId === id || r.analysisId?._id === id || r.analysisId === id);
      if (report) {
        await reportService.download(report._id, analysis.jobTitle);
        toast.success('PDF report downloaded!');
      } else {
        toast.error('Report not found. Please check the Reports page.');
      }
    } catch {
      toast.error('Failed to download report');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!analysis) return null;

  const status = getScoreStatus(analysis.atsScore);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-3 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ATS Analysis Results</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
            <FileText size={14} />
            {analysis.jobTitle || 'Untitled Position'}
            <span className="text-gray-300 dark:text-gray-600">•</span>
            {formatDate(analysis.createdAt)}
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link to="/analysis/new" id="results-new-analysis-btn" className="btn-secondary text-sm py-2.5">
            <PlusCircle size={16} />
            New Analysis
          </Link>
          <button
            id="results-download-btn"
            onClick={handleDownload}
            disabled={downloading}
            className="btn-primary text-sm py-2.5"
          >
            {downloading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><Download size={16} /> Download PDF</>
            )}
          </button>
        </div>
      </div>

      {/* Score & Metrics Hero */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Score circle */}
          <ScoreCircle score={analysis.atsScore} />

          {/* Summary + metrics */}
          <div className="flex-1 w-full">
            <div className="mb-4">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                {analysis.atsScore >= 90 ? 'Excellent ATS Score! 🎉' :
                 analysis.atsScore >= 75 ? 'Good ATS Score! 👍' :
                 analysis.atsScore >= 60 ? 'Average ATS Score' : 'Needs Improvement ⚠️'}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {analysis.atsScore >= 90
                  ? 'Your resume is highly optimized. Excellent chance of passing initial ATS screening.'
                  : analysis.atsScore >= 75
                  ? 'Your resume performs well. A few tweaks will make it even stronger.'
                  : analysis.atsScore >= 60
                  ? 'Your resume meets basic requirements. Follow recommendations below to improve.'
                  : 'Significant improvements needed. Implement the recommendations below to boost your score.'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <MetricBar label="Keyword Match" value={analysis.keywordMatch} />
              <MetricBar label="Format Quality" value={analysis.formatQuality} />
              <MetricBar label="Readability" value={analysis.readability} />
              <MetricBar label="Experience Match" value={analysis.experienceMatch} />
            </div>
          </div>
        </div>
      </div>

      {/* 3-column badges grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {/* Matched Skills */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={18} className="text-emerald-500" />
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">
              Matched Skills ({analysis.matchedSkills?.length || 0})
            </h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Keywords from the job description present in your resume
          </p>
          <BadgeList items={analysis.matchedSkills || []} variant="green" emptyText="No matched skills found" />
        </div>

        {/* Missing Keywords */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <XCircle size={18} className="text-red-500" />
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">
              Missing Keywords ({analysis.missingKeywords?.length || 0})
            </h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Consider adding these keywords from the job description
          </p>
          <BadgeList items={analysis.missingKeywords || []} variant="red" emptyText="No missing keywords — great job!" />
        </div>

        {/* Suggested Keywords */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={18} className="text-purple-500" />
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">
              Suggested Keywords ({analysis.suggestedKeywords?.length || 0})
            </h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Related skills that could strengthen your resume
          </p>
          <BadgeList items={analysis.suggestedKeywords || []} variant="purple" emptyText="No suggestions at this time" />
        </div>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Strengths */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-emerald-500" />
            <h3 className="font-bold text-gray-900 dark:text-white">Resume Strengths</h3>
          </div>
          <ul className="space-y-3">
            {(analysis.strengths || []).map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={12} className="text-emerald-600" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{s}</span>
              </li>
            ))}
            {(!analysis.strengths || analysis.strengths.length === 0) && (
              <p className="text-sm text-gray-400 italic">Complete more details in your resume to show strengths.</p>
            )}
          </ul>
        </div>

        {/* Improvements */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown size={18} className="text-amber-500" />
            <h3 className="font-bold text-gray-900 dark:text-white">Areas for Improvement</h3>
          </div>
          <ul className="space-y-3">
            {(analysis.improvements || []).map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-amber-600">{i + 1}</span>
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
              </li>
            ))}
            {(!analysis.improvements || analysis.improvements.length === 0) && (
              <p className="text-sm text-gray-400 italic">No major issues detected.</p>
            )}
          </ul>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Zap size={18} className="text-indigo-500" />
          <h3 className="font-bold text-gray-900 dark:text-white">Actionable Recommendations</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {(analysis.recommendations || []).map((rec, i) => (
            <div key={i} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all duration-200">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{rec.title}</h4>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border shrink-0 ${getImpactColor(rec.impact)}`}>
                  {rec.impact} impact
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{rec.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-4 mt-8 flex-wrap">
        <Link to="/versions" id="results-versions-btn" className="btn-secondary">
          <BarChart3 size={16} />
          View Version History
        </Link>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="btn-primary"
        >
          <Download size={16} />
          Download PDF Report
        </button>
      </div>
    </div>
  );
}
