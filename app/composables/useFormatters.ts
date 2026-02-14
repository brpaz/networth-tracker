export function useFormatters() {
  const formatCurrency = (value: number, currency = 'EUR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatDate = (value: number | string) => {
    const date = typeof value === 'string' ? new Date(value) : new Date(value * 1000)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return { formatCurrency, formatDate }
}
