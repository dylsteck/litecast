import type { Cast, User } from './types';

export function displayName(user: User): string {
  return user.displayName || user.username || `fid:${user.fid}`;
}

export function handle(user: User): string {
  return user.username ? `@${user.username}` : `fid:${user.fid}`;
}

export function avatarUrl(user: User): string {
  return user.pfp?.url ?? '';
}

export function formatCount(value?: number): string {
  const n = value ?? 0;
  if (n < 1000) return n === 0 ? '' : String(n);
  if (n < 10_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  if (n < 1_000_000) return `${Math.round(n / 1000)}k`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}m`;
}

export function formatRelativeTime(timestamp: number): string {
  const ms = timestamp > 1e12 ? timestamp : timestamp * 1000;
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

export function profileHref(user: User): `/fids/${number}` | `/${string}` {
  return user.username ? `/${user.username}` : `/fids/${user.fid}`;
}

export function threadHref(cast: Cast): `/casts/${string}` {
  return `/casts/${cast.hash}`;
}

export function uniqueByHash(casts: Cast[]): Cast[] {
  const seen = new Set<string>();
  const out: Cast[] = [];
  for (const cast of casts) {
    if (seen.has(cast.hash)) continue;
    seen.add(cast.hash);
    out.push(cast);
  }
  return out;
}
