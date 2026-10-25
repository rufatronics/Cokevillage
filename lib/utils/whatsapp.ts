export function normalizeWhatsAppNumber(phone: string): string {
  let digits = phone.replace(/\D/g, '');

  if (digits.startsWith('0')) {
    digits = '234' + digits.slice(1);
  }

  return digits;
}

export function isValidNigerianPhoneNumber(phone: string): boolean {
  const normalized = normalizeWhatsAppNumber(phone);
  // Nigerian numbers normalized start with 234 followed by 10 digits (total 13 digits)
  return /^234[789][01]\d{8}$/.test(normalized);
}

export function formatWhatsAppUrl(phone: string, text?: string): string {
  const normalized = normalizeWhatsAppNumber(phone);
  const encodedText = text ? encodeURIComponent(text) : '';
  return `https://wa.me/${normalized}${encodedText ? `?text=${encodedText}` : ''}`;
}
