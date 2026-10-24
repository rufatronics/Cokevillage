export function normalizeWhatsAppNumber(phone: string): string {
  // Strip all non-digit characters
  let digits = phone.replace(/\D/g, '');

  // If starts with 0 (e.g. 08012345678), replace leading 0 with 234
  if (digits.startsWith('0')) {
    digits = '234' + digits.slice(1);
  }

  // If user entered e.g. +234..., stripping \D leaves 234... which is correct
  return digits;
}

export function formatWhatsAppUrl(phone: string, text?: string): string {
  const normalized = normalizeWhatsAppNumber(phone);
  const encodedText = text ? encodeURIComponent(text) : '';
  return `https://wa.me/${normalized}${encodedText ? `?text=${encodedText}` : ''}`;
}
