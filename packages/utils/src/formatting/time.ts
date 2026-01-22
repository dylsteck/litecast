const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

export function formatRelativeTime(date: Date | string | number): string {
  const timestamp = typeof date === 'string' ? new Date(date).getTime() :
                   typeof date === 'number' ? date :
                   date.getTime();

  const now = Date.now();
  const diff = now - timestamp;

  if (diff < MINUTE) {
    return 'now';
  }

  if (diff < HOUR) {
    const minutes = Math.floor(diff / MINUTE);
    return `${minutes}m`;
  }

  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return `${hours}h`;
  }

  if (diff < WEEK) {
    const days = Math.floor(diff / DAY);
    return `${days}d`;
  }

  if (diff < MONTH) {
    const weeks = Math.floor(diff / WEEK);
    return `${weeks}w`;
  }

  if (diff < YEAR) {
    const months = Math.floor(diff / MONTH);
    return `${months}mo`;
  }

  const years = Math.floor(diff / YEAR);
  return `${years}y`;
}

export function formatDate(date: Date | string | number): string {
  const d = typeof date === 'string' ? new Date(date) :
           typeof date === 'number' ? new Date(date) :
           date;

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

export function formatDateTime(date: Date | string | number): string {
  const d = typeof date === 'string' ? new Date(date) :
           typeof date === 'number' ? new Date(date) :
           date;

  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    hour: 'numeric',
    minute: '2-digit',
  });
}
