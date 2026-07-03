import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, TrendingUp, TrendingDown, ArrowRight, Calendar,
  BarChart3, Eye,
} from 'lucide-react';
import { userService } from '../services/userService';
import { getScoreStatus, getScoreStrokeColor } from '../utils/scoreHelpers';
import { formatDate, formatScoreChange } from '../utils/formatters';
import toast from 'react-hot-toast';

function MiniCircle({ score, size = 48 }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = getScoreStrokeColor(score);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 48 48" className="-rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="currentColor" strokeWidth="4" className="text-gray-100 dark:text-gray-800" />
        <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-black" style={{ color }}>{score}</span>
      </div>
    </div>
  );
}

export default function ResumeVersions() {
  const [versions, setVersions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const data = await userService.getVersions();
        setVersions(data.versions || []);
        setSummary(data.summary);
      } catch (err) {
        toast.error('Failed to load resume versions');
      } finally {
        setLoading(false);
      }
    };
    fetchVersions();
  }, []);

  // Refresh versions when other parts of app change data
  useEffect(() => {
    const onChange = async () => {
      try {
        const data = await userService.getVersions();
        setVersions(data.versions || []);
        setSummary(data.summary);
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener('riq:data-changed', onChange);
    return () => window.removeEventListener('riq:data-changed', onChange);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const improvement = summary?.totalImprovement ?? 0;
  const isPositive = improvement >= 0;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="page-header mb-0">
          <h1 className="page-title">Resume Versions</h1>
          <p className="page-subtitle">Track how your resume has improved over time</p>
        </div>
        <Link to="/analysis/new" className="btn-primary text-sm py-2.5">
          New Version
        </Link>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="stats-card text-center">
            <p className="section-label mb-2">Current Score</p>
            <p className="text-3xl font-black text-indigo-600">{summary.currentScore}%</p>
          </div>
          <div className="stats-card text-center">
            <p className="section-label mb-2">Started At</p>
            <p className="text-3xl font-black text-gray-700 dark:text-gray-300">{summary.firstScore}%</p>
          </div>
          <div className="stats-card text-center">
            <p className="section-label mb-2">Total Improvement</p>
            <div className={`flex items-center justify-center gap-1 text-3xl font-black ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
              {isPositive ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
              {formatScoreChange(improvement)}
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      {versions.length > 0 ? (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-300 via-purple-300 to-gray-200 dark:from-indigo-800 dark:via-purple-800 dark:to-gray-700" />

          <div className="space-y-6">
            {versions.map((version, idx) => {
              const status = getScoreStatus(version.atsScore);
              const prevScore = idx < versions.length - 1 ? versions[idx + 1].atsScore : null;
              const delta = prevScore !== null ? version.atsScore - prevScore : null;

              return (
                <div key={version._id} className="relative flex gap-6 animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                  {/* Timeline dot */}
                  <div className="relative z-10 shrink-0">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-950 ${idx === 0 ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-white dark:bg-gray-800 border-2'}`}>
                      {idx === 0 ? (
                        <span className="text-white text-xs font-black">v{version.versionNumber}</span>
                      ) : (
                        <MiniCircle score={version.atsScore} />
                      )}
                    </div>
                    {idx === 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-950 flex items-center justify-center">
                        <span className="text-white text-[8px]">✓</span>
                      </div>
                    )}
                  </div>

                  {/* Card */}
                  <div className="flex-1 card p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-900 dark:text-white">
                            Version {version.versionNumber}
                          </span>
                          {idx === 0 && (
                            <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs font-semibold rounded-full">
                              Current
                            </span>
                          )}
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${status.bg} ${status.color} ${status.border}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{version.jobTitle || 'Untitled Position'}</p>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
                          <Calendar size={12} />
                          {formatDate(version.createdAt)}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {delta !== null && (
                          <div className={`flex items-center gap-1 text-sm font-bold ${delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                            {delta > 0 ? <TrendingUp size={14} /> : delta < 0 ? <TrendingDown size={14} /> : null}
                            {delta > 0 ? '+' : ''}{delta}
                          </div>
                        )}
                        <div className="text-right">
                          <p className="text-2xl font-black text-indigo-600">{version.atsScore}%</p>
                          <p className="text-xs text-gray-400">ATS Score</p>
                        </div>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        {version.matchedSkillsCount} matched skills
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <div className="w-2 h-2 rounded-full bg-red-400" />
                        {version.missingKeywordsCount} missing keywords
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <FileText size={12} />
                        {version.resumeFile?.originalName || 'Resume file'}
                      </div>
                    </div>

                    {/* Changes */}
                    {version.changes && version.changes.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {version.changes.slice(0, 2).map((change, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <ArrowRight size={12} className="text-indigo-400 shrink-0 mt-0.5" />
                            {change}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      {version.analysisId && (
                        <Link
                          to={`/analysis/${typeof version.analysisId === 'object' ? version.analysisId._id : version.analysisId}/results`}
                          className="btn-ghost text-xs py-1.5 px-3"
                        >
                          <Eye size={14} />
                          View Analysis
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card p-16 text-center">
          <BarChart3 size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No resume versions yet</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2 mb-6">
            Each analysis you run creates a new version to track your progress
          </p>
          <Link to="/analysis/new" className="btn-primary">
            Run First Analysis
          </Link>
        </div>
      )}
    </div>
  );
}
