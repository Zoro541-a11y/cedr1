import { CEDAR_CURRENCY_SYMBOLS } from './constants';

export function formatPrice(amount: number, currency = 'USD'): string {
  const symbol = CEDAR_CURRENCY_SYMBOLS[currency] ?? '$';
  const value = Number(amount || 0).toFixed(2);
  return `${symbol}${value}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value || 0);
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function discountPercent(price: number, compareAt?: number | null): number {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function effectivePrice(price: number, discountPercentage: number): number {
  if (!discountPercentage) return price;
  return Number((price - (price * discountPercentage) / 100).toFixed(2));
}

export function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  const intervals: [number, string][] = [
    [31536000, 'year'],
    [2592000, 'month'],
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
  ];
  for (const [secs, label] of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function countdown(endsAt: string | Date): {
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
} {
  const d = typeof endsAt === 'string' ? new Date(endsAt) : endsAt;
  const diff = d.getTime() - Date.now();
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, done: true };
  return {
    hours: Math.floor(diff / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
    done: false,
  };
}

export function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CDR-${ts}-${rand}`;
}

export function classNames(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + '…';
}
