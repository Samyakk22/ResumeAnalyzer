import { format, formatDistanceToNow, parseISO } from 'date-fns';

/**
 * Format a date string to "Jan 15, 2024"
 */
export function formatDate(dateStr) {
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr || '—';
  }
}

/**
 * Format a date string to "2 hours ago"
 */
export function timeAgo(dateStr) {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
  } catch {
    return dateStr || '—';
  }
}

/**
 * Format file size in bytes to human readable
 */
export function formatFileSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Truncate long strings
 */
export function truncate(str, maxLength = 50) {
  if (!str) return '';
  return str.length > maxLength ? `${str.substring(0, maxLength)}...` : str;
}

/**
 * Format score change with + or - prefix
 */
export function formatScoreChange(change) {
  if (change > 0) return `+${change}`;
  return String(change);
}
