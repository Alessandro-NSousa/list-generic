const PHONE_DIGITS_ONLY = /\D+/g;

export function normalizePhone(phone: string) {
  return phone.replace(PHONE_DIGITS_ONLY, "");
}

export function isValidPhone(phone: string) {
  const digits = normalizePhone(phone);

  return digits.length >= 10 && digits.length <= 13;
}