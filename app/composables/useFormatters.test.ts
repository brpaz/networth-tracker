import { describe, it, expect } from 'vitest'
import { useFormatters } from './useFormatters'

describe('useFormatters', () => {
  const { formatCurrency, formatDate } = useFormatters()

  describe('formatCurrency', () => {
    it('formats a positive value with EUR by default', () => {
      const result = formatCurrency(1234.56)
      expect(result).toBe('€1,234.56')
    })

    it('formats zero', () => {
      const result = formatCurrency(0)
      expect(result).toBe('€0.00')
    })

    it('formats a negative value', () => {
      const result = formatCurrency(-500.1)
      expect(result).toBe('-€500.10')
    })

    it('formats with USD currency', () => {
      const result = formatCurrency(1000, 'USD')
      expect(result).toBe('$1,000.00')
    })

    it('formats large numbers', () => {
      const result = formatCurrency(1_000_000)
      expect(result).toBe('€1,000,000.00')
    })
  })

  describe('formatDate', () => {
    it('formats a unix timestamp', () => {
      // 2025-01-15 00:00:00 UTC
      const timestamp = 1736899200
      const result = formatDate(timestamp)
      expect(result).toContain('Jan')
      expect(result).toContain('2025')
      expect(result).toContain('15')
    })

    it('formats a different date', () => {
      // 2024-06-01 00:00:00 UTC
      const timestamp = 1717200000
      const result = formatDate(timestamp)
      expect(result).toContain('Jun')
      expect(result).toContain('2024')
    })

    it('formats an ISO date string', () => {
      const result = formatDate('2026-02-14T12:06:38.000Z')
      expect(result).toContain('Feb')
      expect(result).toContain('2026')
      expect(result).toContain('14')
    })
  })
})
