import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, Sun, Moon, CheckCircle2, FileText, BarChart3, Search,
  Layout, GitBranch, Star, ArrowRight, Upload, FileSearch,
  Brain, TrendingUp, ChevronDown, Shield, Clock, Globe,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const features = [
  {
    icon: BarChart3,
    title: 'ATS Score Analysis',
    desc: 'Get a detailed compatibility score showing exactly how well your resume passes ATS filters.',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-900/30',
  },
  {
    icon: Search,
    title: 'Keyword Optimization',
    desc: 'Identify missing keywords from job descriptions to dramatically improve your match rate.',
    color: 'text-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-900/30',
  },
  {
    icon: Globe,
    title: 'Job-Specific Insights',
    desc: 'Tailor your resume for each position with targeted recommendations and insights.',
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-900/30',
  },
  {
    icon: Layout,
    title: 'Format Checker',
    desc: 'Ensure your resume format is ATS-friendly and properly structured for automated parsing.',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50 dark:bg-cyan-900/30',
  },
  {
    icon: GitBranch,
    title: 'Version Tracking',
    desc: 'Track improvements over time and compare different resume versions side by side.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
  },
  {
    icon: Star,
    title: 'Expert Recommendations',
    desc: 'Get actionable tips from industry-proven best practices to strengthen your resume.',
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-900/30',
  },
];

const steps = [
  { num: '01', icon: Upload, title: 'Upload Resume', desc: 'Drag & drop your resume in PDF or DOCX format' },
  { num: '02', icon: FileText, title: 'Paste Job Description', desc: 'Add the job posting you\'re targeting' },
  { num: '03', icon: Brain, title: 'Analyze Resume', desc: 'AI analyzes keywords, format, and ATS compatibility' },
  { num: '04', icon: TrendingUp, title: 'Get ATS Report', desc: 'Receive actionable insights and improvement tips' },
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Software Engineer at Google',
    text: 'ResumeIQ helped me increase my ATS score from 62% to 94%. I got 3x more interview callbacks within a week!',
    rating: 5,
    avatar: 'SC',
  },
  {
    name: 'Marcus Johnson',
    role: 'Product Manager at Meta',
    text: 'The keyword analysis feature is incredible. I was missing obvious terms from my resume. Got my dream job after optimizing.',
    rating: 5,
    avatar: 'MJ',
  },
  {
    name: 'Priya Patel',
    role: 'Data Scientist at Amazon',
    text: 'Version tracking helped me see my progress over time. Went from rejected to hired in 3 resume iterations.',
    rating: 5,
    avatar: 'PP',
  },
];

export default function Landing() {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* ─── NAVBAR ──────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-sm border-b border-gray-100 dark:border-gray-800'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">
                Resume<span className="text-indigo-600">IQ</span>
              </span>
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              {['Features', 'How It Works', 'Testimonials'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                  id={`nav-${item.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                id="landing-theme-toggle"
                className="p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <Link
                to="/login"
                id="nav-signin-btn"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                id="nav-get-started-btn"
                className="btn-primary text-sm py-2 px-4"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── HERO ────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-4 mesh-gradient overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl -translate-x-1/2" />
        <div className="absolute top-32 right-1/4 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl translate-x-1/2" />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-full text-indigo-700 dark:text-indigo-400 text-sm font-medium mb-8 animate-fade-in">
            <Zap size={14} />
            AI-Powered Resume Analysis
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6 animate-slide-up">
            Improve Your{' '}
            <span className="gradient-text">ATS Score</span>
            {' '}Before You Apply
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in">
            Get instant feedback on your resume's compatibility with Applicant Tracking Systems.
            Optimize your chances of landing interviews with data-driven insights.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
            <Link to="/signup" id="hero-start-btn" className="btn-primary text-base px-8 py-4 shadow-indigo">
              Start Free Analysis <ArrowRight size={18} />
            </Link>
            <a href="#how-it-works" id="hero-howto-btn" className="btn-secondary text-base px-8 py-4">
              See How It Works
            </a>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 animate-fade-in">
            {[
              { icon: Shield, text: 'Secure & Private' },
              { icon: Clock, text: 'Results in Seconds' },
              { icon: CheckCircle2, text: 'No Credit Card' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Icon size={16} className="text-emerald-500" />
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Feature highlights */}
        <div className="max-w-4xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
          {[
            { icon: CheckCircle2, title: 'ATS Compatible', subtitle: 'Works with all major ATS systems' },
            { icon: FileText, title: 'PDF & DOCX Support', subtitle: 'Upload any resume format' },
            { icon: Zap, title: 'Instant Analysis', subtitle: 'Results in under 10 seconds' },
            { icon: Shield, title: 'Secure Processing', subtitle: 'Your data stays private' },
          ].map(({ icon: Icon, title, subtitle }) => (
            <div key={title} className="card p-4 text-center hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Icon size={20} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="font-semibold text-sm text-gray-900 dark:text-white">{title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PRODUCT PREVIEW ─────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="badge-indigo text-xs mb-4 inline-block">Dashboard Preview</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Powerful Analysis at a Glance
            </h2>
          </div>
          {/* Dashboard mockup */}
          <div className="card overflow-hidden shadow-2xl">
            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-white dark:bg-gray-700 rounded-md px-3 py-1 text-xs text-gray-500 dark:text-gray-400">
                  dashboard.resumeiq.app/analyze
                </div>
              </div>
            </div>
            <div className="p-6 bg-white dark:bg-gray-900 grid grid-cols-2 gap-6">
              {/* Left panel */}
              <div className="space-y-4">
                <div className="card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText size={16} className="text-indigo-500" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Uploaded Resume</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                    <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                      <FileText size={16} className="text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">Resume.pdf</p>
                      <p className="text-xs text-gray-500">250 KB</p>
                    </div>
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  </div>
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">Skills Detected:</p>
                    <div className="flex flex-wrap gap-1">
                      {['React', 'Node.js', 'MongoDB', 'Express.js'].map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs rounded-full border border-emerald-200 dark:border-emerald-800">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Search size={16} className="text-purple-500" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Job Description</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">Required Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {['React', 'Node.js', 'MongoDB', 'AWS', 'Docker', 'CI/CD'].map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {/* Right panel — Score */}
              <div className="space-y-4">
                <div className="card p-4 flex flex-col items-center justify-center">
                  <p className="text-xs font-semibold text-gray-500 mb-2">ATS Score</p>
                  <div className="relative w-24 h-24 mb-2">
                    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#6366f1" strokeWidth="8"
                        strokeDasharray="283" strokeDashoffset="42" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-black text-indigo-600">84%</span>
                    </div>
                  </div>
                </div>
                <div className="card p-4 space-y-2">
                  <div className="flex items-center gap-1.5 mb-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">Matched Skills</span>
                  </div>
                  {['React', 'Node.js', 'MongoDB', 'Express.js'].map((s) => (
                    <div key={s} className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs rounded-lg">
                      ✓ {s}
                    </div>
                  ))}
                  <div className="flex items-center gap-1.5 mt-3 mb-2">
                    <Search size={14} className="text-red-500" />
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">Missing Keywords</span>
                  </div>
                  {['AWS', 'Docker', 'CI/CD'].map((s) => (
                    <div key={s} className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs rounded-lg">
                      ✗ {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge-indigo text-xs mb-4 inline-block">Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Optimize Your Resume
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Powerful tools designed to help you stand out in the job market
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="card p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={22} className={color} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge-purple text-xs mb-4 inline-block">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Simple, Fast, and Effective
            </h2>
            <p className="text-gray-500 dark:text-gray-400">Get your ATS score in four easy steps</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connector line (desktop) */}
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-indigo-200 via-purple-200 to-indigo-200 dark:from-indigo-800 dark:via-purple-800 dark:to-indigo-800" />
            {steps.map(({ num, icon: Icon, title, desc }, idx) => (
              <div key={num} className="card p-6 text-center relative hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10 shadow-lg shadow-indigo-500/25">
                  <span className="text-white font-black text-sm">{num}</span>
                </div>
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={22} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ────────────────────────────────────────── */}
      <section id="testimonials" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge-green text-xs mb-4 inline-block">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Loved by Job Seekers
            </h2>
            <p className="text-gray-500 dark:text-gray-400">Join thousands who landed their dream jobs</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, text, rating, avatar }) => (
              <div key={name} className="card p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    {avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 p-12 text-center overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-white/5 rounded-full" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                Ready to Land Your Dream Job?
              </h2>
              <p className="text-indigo-200 mb-8 text-lg">
                Join thousands of job seekers who optimized their resumes with ResumeIQ
              </p>
              <Link
                to="/signup"
                id="cta-signup-btn"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-xl shadow-black/20 text-base"
              >
                Start Your Free Analysis <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">
              Resume<span className="text-indigo-600">IQ</span>
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2024 ResumeIQ. Built to help you get hired faster.
          </p>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Contact'].map((link) => (
              <a key={link} href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
