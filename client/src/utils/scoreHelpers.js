/**
 * Get score status label, color class and description
 */
export function getScoreStatus(score) {
  if (score >= 90) return { label: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/30', border: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' };
  if (score >= 75) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800', dot: 'bg-blue-500' };
  if (score >= 60) return { label: 'Average', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/30', border: 'border-amber-200 dark:border-amber-800', dot: 'bg-amber-500' };
  return { label: 'Needs Work', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/30', border: 'border-red-200 dark:border-red-800', dot: 'bg-red-500' };
}

/**
 * Get color class for a score bar fill
 */
export function getScoreBarColor(score) {
  if (score >= 75) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-red-500';
}

/**
 * Get the stroke color for SVG score circle
 */
export function getScoreStrokeColor(score) {
  if (score >= 90) return '#10B981';
  if (score >= 75) return '#6366F1';
  if (score >= 60) return '#F59E0B';
  return '#EF4444';
}

/**
 * Calculate SVG circle dash offset for score animation
 * Circle circumference: 2 * PI * r = 2 * PI * 45 ≈ 283
 */
export function getCircleDashOffset(score, circumference = 283) {
  return circumference - (score / 100) * circumference;
}

/**
 * Get impact badge color
 */
export function getImpactColor(impact) {
  switch (impact) {
    case 'high': return 'text-red-600 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800';
    case 'medium': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800';
    case 'low': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800';
    default: return 'text-gray-600 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
  }
}
