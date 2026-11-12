/** The store's WhatsApp numbers, used until the owner saves her own in Admin > Settings. */
export const DEFAULT_WHATSAPP = "919817742416, 918708863593";

/**
 * Reads one or more WhatsApp numbers from text such as "9817742416 ; 8708863593" and returns them
 * as digits with the country code (India's 91 is added to 10-digit numbers).
 */
export function parseWhatsappNumbers(raw: string): string[] {
  const out: string[] = [];
  for (const part of raw.split(/[,;|/\n]+/)) {
    let digits = part.replace(/\D/g, "");
    if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
    if (digits.length === 10) digits = `91${digits}`;
    if (digits.length >= 11 && digits.length <= 15 && !out.includes(digits)) out.push(digits);
  }
  return out;
}

/** 919817742416 -> "+91 98177 42416" */
export function formatWhatsapp(digits: string): string {
  if (digits.length === 12 && digits.startsWith("91")) return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  return `+${digits}`;
}

export function whatsappLink(digits: string, text?: string): string {
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
