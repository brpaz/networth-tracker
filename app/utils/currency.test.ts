import { describe, it, expect } from 'vitest';
import { formatCurrency } from './currency';

describe('formatCurrency', () => {
  it('formats a positive value with EUR by default', () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain('€');
    expect(result).toContain('1');
    expect(result).toContain('234');
  });

  it('formats zero', () => {
    const result = formatCurrency(0);
    expect(result).toContain('€');
    expect(result).toContain('0');
  });

  it('formats a negative value', () => {
    const result = formatCurrency(-500.1);
    expect(result).toContain('€');
    expect(result).toContain('500');
  });

  it('formats with USD currency', () => {
    const result = formatCurrency(1000, 'USD');
    expect(result).toContain('$');
    expect(result).toContain('1');
    expect(result).toContain('000');
  });

  it('formats large numbers', () => {
    const result = formatCurrency(1_000_000);
    expect(result).toContain('€');
    expect(result).toContain('000');
  });
});
