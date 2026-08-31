import { formatCount, formatRelativeTime, uniqueByHash } from './format';
import type { Cast } from './types';

const cast = (hash: string): Cast => ({
  hash,
  text: '',
  timestamp: 1,
  author: { fid: 1, displayName: 'A' },
});

describe('format', () => {
  it('formats counts', () => {
    expect(formatCount(0)).toBe('');
    expect(formatCount(12)).toBe('12');
    expect(formatCount(1200)).toBe('1.2k');
  });

  it('formats relative time', () => {
    expect(formatRelativeTime(Date.now() - 30_000)).toBe('now');
    expect(formatRelativeTime(Date.now() - 5 * 60_000)).toBe('5m');
  });

  it('dedupes casts', () => {
    expect(uniqueByHash([cast('a'), cast('a'), cast('b')]).map((item) => item.hash)).toEqual(['a', 'b']);
  });
});
