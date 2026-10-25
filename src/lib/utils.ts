/**
 * Format a number into standard thousands separator (e.g. 14850 -> "14.850").
 * Deterministic for SSR / hydration consistency.
 */
export function formatThousands(n: number): string {
  if (typeof n !== 'number' || isNaN(n)) return '0';
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Format a number into a human-readable short form.
 * 1234 → "1.2K", 1234567 → "1.2M"
 */
export function formatNumber(n: number): string {
  if (n >= 1_000_000_000) {
    return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (n >= 1_000_000) {
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (n >= 1_000) {
    return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return n.toString();
}

/**
 * Format a date string as relative time in Indonesian.
 * e.g. "2 jam lalu", "3 hari lalu"
 */
export function formatDate(date: string): string {
  return getRelativeTime(date);
}

/**
 * Truncate a string to a given length, appending "..." if truncated.
 */
export function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.slice(0, len).trimEnd() + '...';
}

/**
 * Generate a random ID string (URL-safe, 21 chars).
 */
export function generateId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  const bytes = new Uint8Array(21);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < 21; i++) {
    id += chars[bytes[i] % chars.length];
  }
  return id;
}

/**
 * Classnames helper — filters falsy values and joins with space.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Returns relative time in Indonesian.
 * e.g. "Baru saja", "5 menit lalu", "2 jam lalu", "3 hari lalu"
 */
export function getRelativeTime(date: string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffMs = now - then;

  if (diffMs < 0) {
    // Future date
    const absDiff = Math.abs(diffMs);
    const minutes = Math.floor(absDiff / 60_000);
    const hours = Math.floor(absDiff / 3_600_000);
    const days = Math.floor(absDiff / 86_400_000);

    if (minutes < 1) return 'Sebentar lagi';
    if (minutes < 60) return `Dalam ${minutes} menit`;
    if (hours < 24) return `Dalam ${hours} jam`;
    if (days < 30) return `Dalam ${days} hari`;
    return `Dalam ${Math.floor(days / 30)} bulan`;
  }

  const seconds = Math.floor(diffMs / 1_000);
  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(diffMs / 86_400_000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 30) return 'Baru saja';
  if (seconds < 60) return `${seconds} detik lalu`;
  if (minutes < 60) return `${minutes} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days < 7) return `${days} hari lalu`;
  if (weeks < 5) return `${weeks} minggu lalu`;
  if (months < 12) return `${months} bulan lalu`;
  return `${years} tahun lalu`;
}
