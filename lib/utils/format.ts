export function koboToNaira(kobo: number): number {
  return kobo / 100;
}

export function nairaToKobo(naira: number | string): number {
  const parsed = typeof naira === 'string' ? parseFloat(naira) : naira;
  if (isNaN(parsed) || parsed < 0) {
    throw new Error('Price must be a valid non-negative number');
  }
  return Math.round(parsed * 100);
}

export function formatCurrencyNaira(kobo: number): string {
  const naira = koboToNaira(kobo);
  return `₦${naira.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
