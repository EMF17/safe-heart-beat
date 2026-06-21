export interface EmergencyService {
  label: string;
  number: string;
}

export interface CountryEmergency {
  code: string; // ISO 3166-1 alpha-2
  country: string;
  flag: string;
  services: EmergencyService[];
}

export const emergencyNumbers: CountryEmergency[] = [
  {
    code: "AU",
    country: "Australia",
    flag: "🇦🇺",
    services: [
      { label: "General emergency", number: "000" },
      { label: "Mobile emergency", number: "112" },
    ],
  },
  {
    code: "BR",
    country: "Brazil",
    flag: "🇧🇷",
    services: [
      { label: "Police", number: "190" },
      { label: "Ambulance", number: "192" },
      { label: "Fire", number: "193" },
    ],
  },
  {
    code: "CA",
    country: "Canada",
    flag: "🇨🇦",
    services: [{ label: "General emergency", number: "911" }],
  },
  {
    code: "CN",
    country: "China",
    flag: "🇨🇳",
    services: [
      { label: "Police", number: "110" },
      { label: "Ambulance", number: "120" },
      { label: "Fire", number: "119" },
    ],
  },
  {
    code: "DE",
    country: "Germany",
    flag: "🇩🇪",
    services: [{ label: "General emergency", number: "112" }],
  },
  {
    code: "ES",
    country: "Spain",
    flag: "🇪🇸",
    services: [{ label: "General emergency", number: "112" }],
  },
  {
    code: "FR",
    country: "France",
    flag: "🇫🇷",
    services: [{ label: "General emergency", number: "112" }],
  },
  {
    code: "IN",
    country: "India",
    flag: "🇮🇳",
    services: [{ label: "General emergency", number: "112" }],
  },
  {
    code: "IT",
    country: "Italy",
    flag: "🇮🇹",
    services: [{ label: "General emergency", number: "112" }],
  },
  {
    code: "JP",
    country: "Japan",
    flag: "🇯🇵",
    services: [
      { label: "Ambulance / Fire", number: "119" },
      { label: "Police", number: "110" },
    ],
  },
  {
    code: "MX",
    country: "Mexico",
    flag: "🇲🇽",
    services: [{ label: "General emergency", number: "911" }],
  },
  {
    code: "NZ",
    country: "New Zealand",
    flag: "🇳🇿",
    services: [{ label: "General emergency", number: "111" }],
  },
  {
    code: "ZA",
    country: "South Africa",
    flag: "🇿🇦",
    services: [
      { label: "Police", number: "10111" },
      { label: "Ambulance", number: "10177" },
    ],
  },
  {
    code: "GB",
    country: "United Kingdom",
    flag: "🇬🇧",
    services: [
      { label: "General emergency", number: "999" },
      { label: "Mobile emergency", number: "112" },
    ],
  },
  {
    code: "US",
    country: "United States",
    flag: "🇺🇸",
    services: [{ label: "General emergency", number: "911" }],
  },
].sort((a, b) => a.country.localeCompare(b.country));
