import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp, FileText, Award, BarChart3, PlusCircle,
  ArrowRight, Clock, ChevronRight, Zap,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { userService } from '../services/userService';
import { analysisService } from '../services/analysisService';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getScoreStatus } from '../utils/scoreHelpers';
import { formatDate, timeAgo } from '../utils/formatters';
import { Sun, Moon } from 'lucide-react';

function StatCard({ icon: Icon, label, value, subtext, color, bg }) {
  return (
    <div className="stats-card group hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center`}>
          <Icon size={20} className={color} />
        </div>
        <TrendingUp size={16} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="mt-4">
        <p className="text-3xl font-black text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mt-1">{label}</p>
        {subtext && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtext}</p>}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 shadow-lg">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-lg font-bold text-indigo-600">{payload[0].value}<span className="text-xs ml-1 text-gray-400">/ 100</span></p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, analysesRes] = await Promise.all([
          userService.getStats(),
          analysisService.getAll(),
        ]);
        setStats(statsRes.stats);
        setAnalyses(analysesRes.analyses?.slice(0, 6) || []);

        // Build chart data from score history
        const history = statsRes.scoreHistory || [];
        const chartPoints = history
          .slice(-8)
          .map((h, i) => ({
            date: formatDate(h.date).replace(/,\s*\d{4}/, ''),
            score: h.score,
            name: h.jobTitle?.substring(0, 15) || `Analysis ${i + 1}`,
          }))
          .reverse();
        setChartData(chartPoints);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Re-fetch stats when navigating back to dashboard to ensure counts are fresh
  useEffect(() => {
    const onVisibility = async () => {
      try {
        const statsRes = await userService.getStats();
        setStats(statsRes.stats);
      } catch (e) {
        // ignore
      }
    };
    window.addEventListener('focus', onVisibility);
    window.addEventListener('riq:data-changed', onVisibility);
    return () => {
      window.removeEventListener('focus', onVisibility);
      window.removeEventListener('riq:data-changed', onVisibility);
    };
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {greeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Here's an overview of your resume performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            id="dashboard-theme-toggle"
            className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link to="/analysis/new" id="dashboard-new-analysis-btn" className="btn-primary py-2.5 px-5 text-sm">
            <PlusCircle size={16} />
            New Analysis
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={BarChart3}
          label="Total Analyses"
          value={stats?.totalAnalyses ?? 0}
          subtext="All time"
          color="text-indigo-600"
          bg="bg-indigo-50 dark:bg-indigo-900/30"
        />
        <StatCard
          icon={TrendingUp}
          label="Average ATS Score"
          value={stats?.avgScore ? `${stats.avgScore}%` : '—'}
          subtext="Across all resumes"
          color="text-purple-600"
          bg="bg-purple-50 dark:bg-purple-900/30"
        />
        <StatCard
          icon={Award}
          label="Highest Score"
          value={stats?.highestScore ? `${stats.highestScore}%` : '—'}
          subtext="Best performance"
          color="text-amber-600"
          bg="bg-amber-50 dark:bg-amber-900/30"
        />
        <StatCard
          icon={FileText}
          label="Resume Versions"
          value={stats?.uploadedResumes ?? 0}
          subtext="Uploaded files"
          color="text-emerald-600"
          bg="bg-emerald-50 dark:bg-emerald-900/30"
        />
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart — ATS Progress */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">ATS Score Progress</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Your score trend over time</p>
            </div>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#f3f4f6'} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#scoreGradient)"
                  dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#6366f1' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex flex-col items-center justify-center text-center">
              <BarChart3 size={40} className="text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">No data yet</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Run your first analysis to see progress</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/analysis/new"
              id="quick-new-analysis"
              className="flex items-center gap-4 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <PlusCircle size={18} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">Start New Analysis</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Upload resume + job description</p>
              </div>
              <ArrowRight size={16} className="ml-auto text-gray-400 group-hover:text-indigo-600 transition-colors" />
            </Link>
            <Link
              to="/reports"
              id="quick-view-reports"
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-purple-200 dark:hover:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <BarChart3 size={18} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">View Reports</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">View analysis reports</p>
              </div>
              <ArrowRight size={16} className="ml-auto text-gray-400 group-hover:text-purple-600 transition-colors" />
            </Link>
            <Link
              to="/versions"
              id="quick-view-versions"
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText size={18} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">Resume Versions</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Track improvement history</p>
              </div>
              <ArrowRight size={16} className="ml-auto text-gray-400 group-hover:text-emerald-600 transition-colors" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Analyses */}
      <div className="card mt-6">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-white">Recent Analyses</h2>
          <Link to="/reports" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1">
            View All <ChevronRight size={14} />
          </Link>
        </div>
        {analyses.length > 0 ? (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {analyses.map((analysis) => {
              const status = getScoreStatus(analysis.atsScore);
              return (
                <Link
                  key={analysis._id}
                  to={`/analysis/${analysis._id}/results`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                      {analysis.jobTitle || 'Untitled Position'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">{timeAgo(analysis.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-lg font-black text-indigo-600">{analysis.atsScore}%</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.bg} ${status.color} border ${status.border}`}>
                      {status.label}
                    </span>
                    <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Zap size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No analyses yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1 mb-6">Upload your first resume to get started</p>
            <Link to="/analysis/new" className="btn-primary text-sm py-2.5 px-6">
              <PlusCircle size={16} />
              Start First Analysis
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
