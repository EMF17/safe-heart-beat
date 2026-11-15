export function normalizeContactPhone(value: string): string | null {
  const phone = value.trim().replace(/[\s().-]/g, "");
  if (!phone) return null;
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
    throw new Error("Enter a phone number with country code, for example +852 9123 4567.");
  }
  return phone;
}