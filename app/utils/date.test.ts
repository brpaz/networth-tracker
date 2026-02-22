import { describe, it, expect } from 'vitest';
import { formatDate } from './date';

describe('formatDate', () => {
  it('formats a unix timestamp', () => {
    // 2025-01-15 00:00:00 UTC
    const result = formatDate(1736899200);
    expect(result).toContain('Jan');
    expect(result).toContain('2025');
    expect(result).toContain('15');
  });

  it('formats a different unix timestamp', () => {
    // 2024-06-01 00:00:00 UTC
    const result = formatDate(1717200000);
    expect(result).toContain('Jun');
    expect(result).toContain('2024');
  });

  it('formats an ISO date string', () => {
    const result = formatDate('2026-02-14T12:06:38.000Z');
    expect(result).toContain('Feb');
    expect(result).toContain('2026');
    expect(result).toContain('14');
  });
});
