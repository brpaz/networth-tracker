export function formatCurrency(value: number, currency = 'EUR') {
  // using `undefined` allows to use the browsers default configuration
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}
