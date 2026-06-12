import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { analysisService } from '../services/analysisService';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 1, label: 'Parsing Resume', detail: 'Extracting text from your document...' },
  { id: 2, label: 'Extracting Skills', detail: 'Identifying keywords and technologies...' },
  { id: 3, label: 'Matching Job Description', detail: 'Comparing against job requirements...' },
  { id: 4, label: 'Generating Report', detail: 'Calculating scores and recommendations...' },
];

export default function ProcessingScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const { file, jobDescription, jobTitle } = location.state || {};

  useEffect(() => {
    if (!file || !jobDescription) {
      navigate('/analysis/new');
      return;
    }

    const runAnalysis = async () => {
      // Animate steps while waiting for API
      let stepInterval;
      let stepIdx = 0;

      stepInterval = setInterval(() => {
        if (stepIdx < STEPS.length - 1) {
          stepIdx++;
          setCurrentStep(stepIdx);
          setProgress(Math.round((stepIdx / STEPS.length) * 85));
        }
      }, 900);

      try {
        const result = await analysisService.create(file, jobDescription, jobTitle);
        clearInterval(stepInterval);
        setCurrentStep(STEPS.length);
        setProgress(100);

        // Short pause to show completion
        setTimeout(() => {
          toast.success(`Analysis complete! ATS Score: ${result.analysis.atsScore}%`);
          navigate(`/analysis/${result.analysis._id}/results`);
        }, 800);
      } catch (err) {
        clearInterval(stepInterval);
        const msg = err.response?.data?.message || 'Analysis failed. Please try again.';
        setError(msg);
        toast.error(msg);
      }
    };

    runAnalysis();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="card max-w-md w-full p-8 text-center animate-scale-in">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Analysis Failed</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate('/analysis/new')}
            className="btn-primary w-full"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
      <div className="card max-w-lg w-full p-10 text-center animate-fade-in">
        {/* Animated icon */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-indigo-100 dark:bg-indigo-900/30 animate-pulse-ring" />
          <div className="absolute inset-2 rounded-full bg-indigo-200 dark:bg-indigo-900/40 animate-pulse-ring" style={{ animationDelay: '0.3s' }} />
          <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl shadow-indigo-500/30">
            <Loader2 size={36} className="text-white animate-spin" />
          </div>
        </div>

        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
          Analyzing Your Resume
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Our ATS engine is processing your resume. This takes just a few seconds.
        </p>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Progress</span>
            <span className="font-semibold text-indigo-600">{progress}%</span>
          </div>
          <div className="score-bar h-3">
            <div
              className="score-bar-fill bg-gradient-to-r from-indigo-500 to-purple-600"
              style={{ width: `${progress}%`, transition: 'width 0.8s ease-out' }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3 text-left">
          {STEPS.map((step, idx) => {
            const done = currentStep > idx;
            const active = currentStep === idx;
            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 ${
                  done ? 'bg-emerald-50 dark:bg-emerald-900/20' : active ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'opacity-40'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  done ? 'bg-emerald-500' : active ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}>
                  {done ? (
                    <CheckCircle2 size={16} className="text-white" />
                  ) : active ? (
                    <Loader2 size={14} className="text-white animate-spin" />
                  ) : (
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{step.id}</span>
                  )}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${done ? 'text-emerald-700 dark:text-emerald-400' : active ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {step.label}
                  </p>
                  {active && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 animate-fade-in">
                      {step.detail}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
