import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileBarChart2, Trash2, Eye, Search, TrendingUp,
  Award, BarChart3, AlertTriangle, X,
} from 'lucide-react';
import { reportService } from '../services/reportService';
import { getScoreStatus } from '../utils/scoreHelpers';
import { formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

function DeleteModal({ report, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative card max-w-sm w-full p-6 animate-scale-in">
        <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={22} className="text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">Delete Report</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
          Are you sure you want to delete the report for <strong>{report.jobTitle}</strong>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1 py-2.5">Cancel</button>
          <button onClick={onConfirm} className="flex-1 btn-primary py-2.5 bg-red-600 hover:bg-red-700 focus:ring-red-500">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ total: 0, avgScore: 0, bestScore: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchReports = async (q = '') => {
    setLoading(true);
    try {
      const data = await reportService.getAll(q);
      setReports(data.reports || []);
      setStats(data.stats || { total: 0, avgScore: 0, bestScore: 0 });
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchReports(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDownload = async (report) => {
    // PDF downloads removed — show message and no-op
    toast.error('PDF download removed from the application');
  };

  const handleDelete = async () => {
    try {
      await reportService.delete(deleteTarget._id);
      // Refresh list and dashboard stats after deletion
      await fetchReports();
      // notify other pages to refresh counts/stats
      try { window.dispatchEvent(new Event('riq:data-changed')); } catch (e) {}
      toast.success('Report deleted');
    } catch {
      toast.error('Failed to delete report');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
        <p className="page-subtitle">All your ATS analysis reports in one place</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: FileBarChart2, label: 'Total Reports', value: stats.total, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
          { icon: TrendingUp, label: 'Average Score', value: stats.avgScore ? `${stats.avgScore}%` : '—', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/30' },
          { icon: Award, label: 'Best Score', value: stats.bestScore ? `${stats.bestScore}%` : '—', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="stats-card">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          id="reports-search-input"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-11 pr-10"
          placeholder="Search by job title..."
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reports.length > 0 ? (
        <div className="card overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
            <div className="col-span-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Position</div>
            <div className="col-span-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score</div>
            <div className="col-span-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</div>
            <div className="col-span-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</div>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {reports.map((report) => {
              const status = getScoreStatus(report.reportData?.atsScore || 0);
              return (
                <div key={report._id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors items-center">
                  <div className="col-span-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center shrink-0">
                        <FileBarChart2 size={16} className="text-indigo-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                          {report.jobTitle || 'Untitled Position'}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                          {report.reportData?.resumeFileName || 'Resume'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="flex flex-col gap-1">
                      <span className="font-black text-indigo-600">{report.reportData?.atsScore || 0}%</span>
                      <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{formatDate(report.createdAt)}</span>
                  </div>
                  <div className="col-span-3 flex items-center justify-end gap-1">
                    {report.analysisId && (
                      <Link
                        to={`/analysis/${typeof report.analysisId === 'object' ? report.analysisId._id : report.analysisId}/results`}
                        className="p-2 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                        title="View Analysis"
                      >
                        <Eye size={16} />
                      </Link>
                    )}
                    {/* PDF download removed */}
                    <button
                      onClick={() => setDeleteTarget(report)}
                      id={`delete-report-${report._id}`}
                      className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete Report"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card p-16 text-center">
          <BarChart3 size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
            {search ? 'No reports match your search' : 'No reports yet'}
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2 mb-6">
            {search ? 'Try a different search term' : 'Reports are automatically created when you analyze a resume'}
          </p>
          {!search && (
            <Link to="/analysis/new" className="btn-primary">
              Run First Analysis
            </Link>
          )}
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <DeleteModal
          report={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
