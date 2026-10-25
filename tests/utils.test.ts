import { describe, it, expect } from 'vitest';
import { normalizeWhatsAppNumber, isValidNigerianPhoneNumber } from '../lib/utils/whatsapp';
import { nairaToKobo, koboToNaira, formatCurrencyNaira } from '../lib/utils/format';

describe('WhatsApp Number Utilities', () => {
  it('normalizes leading 0 to 234', () => {
    expect(normalizeWhatsAppNumber('08012345678')).toBe('2348012345678');
  });

  it('handles +234 and spaces', () => {
    expect(normalizeWhatsAppNumber('+234 801 234 5678')).toBe('2348012345678');
  });

  it('validates Nigerian phone numbers correctly', () => {
    expect(isValidNigerianPhoneNumber('08012345678')).toBe(true);
    expect(isValidNigerianPhoneNumber('+2348012345678')).toBe(true);
    expect(isValidNigerianPhoneNumber('12345')).toBe(false);
  });
});

describe('Price Conversion & Currency Format Utilities', () => {
  it('converts Naira to Kobo accurately', () => {
    expect(nairaToKobo(1500)).toBe(150000);
    expect(nairaToKobo('1500.50')).toBe(150050);
  });

  it('converts Kobo to Naira', () => {
    expect(koboToNaira(150000)).toBe(1500);
  });

  it('formats Naira currency string', () => {
    expect(formatCurrencyNaira(150000)).toBe('₦1,500');
  });

  it('throws on negative or invalid Naira input', () => {
    expect(() => nairaToKobo(-50)).toThrow();
    expect(() => nairaToKobo('abc')).toThrow();
  });
});
