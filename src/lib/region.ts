import { emergencyNumbers, type CountryEmergency } from "./emergency-numbers";

const TRAVEL_MODE_KEY = "pulse:travelMode";
const TRAVEL_COUNTRY_KEY = "pulse:travelCountry";

const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  "America/New_York": "US",
  "America/Detroit": "US",
  "America/Chicago": "US",
  "America/Denver": "US",
  "America/Phoenix": "US",
  "America/Los_Angeles": "US",
  "America/Anchorage": "US",
  "America/Toronto": "CA",
  "America/Vancouver": "CA",
  "Europe/London": "GB",
  "Europe/Paris": "FR",
  "Europe/Berlin": "DE",
  "Europe/Madrid": "ES",
  "Europe/Rome": "IT",
  "Australia/Sydney": "AU",
  "Australia/Melbourne": "AU",
  "Australia/Brisbane": "AU",
  "Australia/Perth": "AU",
  "Pacific/Auckland": "NZ",
  "Asia/Tokyo": "JP",
  "Asia/Shanghai": "CN",
  "Asia/Kolkata": "IN",
  "America/Sao_Paulo": "BR",
  "America/Mexico_City": "MX",
  "Africa/Johannesburg": "ZA",
};

export function detectCountryCode(): string | null {
  if (typeof navigator === "undefined") return null;
  const locales = Array.isArray(navigator.languages)
    ? navigator.languages
    : [navigator.language];
  for (const locale of locales) {
    const match = locale?.match(/[-_]([a-zA-Z]{2})$/);
    if (match) return match[1].toUpperCase();
  }
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return TIMEZONE_TO_COUNTRY[tz] ?? null;
  } catch {
    return null;
  }
}

/** Resolve the user's active country code: Travel Mode selection wins, else auto-detected. */
export function getActiveCountryCode(): string | null {
  if (typeof localStorage === "undefined") return detectCountryCode();
  try {
    const travelOn = localStorage.getItem(TRAVEL_MODE_KEY) === "1";
    const selected = localStorage.getItem(TRAVEL_COUNTRY_KEY);
    if (travelOn && selected) return selected;
  } catch {
    // ignore
  }
  return detectCountryCode();
}

export function getActiveCountry(): CountryEmergency | null {
  const code = getActiveCountryCode();
  if (!code) return null;
  return emergencyNumbers.find((c) => c.code === code) ?? null;
}
