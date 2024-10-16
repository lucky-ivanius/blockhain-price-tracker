export function formatCurrency(number: number) {
  const formatted = Number(number)
    .toFixed(8)
    .replace(/\.?0+$/, '');

  if (formatted.indexOf('.') !== formatted.length - 1) return formatted;

  return formatted.slice(0, -1);
}
