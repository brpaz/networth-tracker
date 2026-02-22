import { describe, it, expect, vi } from 'vitest';

vi.stubGlobal('useRuntimeConfig', vi.fn());

import { useBaseCurrency } from './useBaseCurrency';

describe('useBaseCurrency', () => {
  it('returns the configured base currency', () => {
    vi.mocked(useRuntimeConfig).mockReturnValue({
      public: { baseCurrency: 'EUR' },
    } as ReturnType<typeof useRuntimeConfig>);

    expect(useBaseCurrency()).toBe('EUR');
  });

  it('returns the configured base currency when set to USD', () => {
    vi.mocked(useRuntimeConfig).mockReturnValue({
      public: { baseCurrency: 'USD' },
    } as ReturnType<typeof useRuntimeConfig>);

    expect(useBaseCurrency()).toBe('USD');
  });
});
