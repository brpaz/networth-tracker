export function formatDate(value: number | string) {
  const date = typeof value === 'string' ? new Date(value) : new Date(value * 1000);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
