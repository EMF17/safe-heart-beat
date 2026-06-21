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
    code: "DZ",
    country: "Algeria",
    flag: "🇩🇿",
    services: [
      { label: "Police", number: "17" },
      { label: "Ambulance", number: "16" },
      { label: "Fire", number: "14" },
    ],
  },
  {
    code: "AR",
    country: "Argentina",
    flag: "🇦🇷",
    services: [
      { label: "Police", number: "101" },
      { label: "Ambulance", number: "107" },
      { label: "Fire", number: "100" },
      { label: "General emergency", number: "911" },
    ],
  },
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
    code: "BO",
    country: "Bolivia",
    flag: "🇧🇴",
    services: [
      { label: "Police", number: "110" },
      { label: "Ambulance", number: "160" },
      { label: "Fire", number: "119" },
      { label: "General emergency", number: "911" },
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
    code: "TD",
    country: "Chad",
    flag: "🇹🇩",
    services: [
      { label: "Police", number: "17" },
      { label: "Fire", number: "18" },
    ],
  },
  {
    code: "CL",
    country: "Chile",
    flag: "🇨🇱",
    services: [
      { label: "Police", number: "133" },
      { label: "Ambulance", number: "131" },
      { label: "Fire", number: "132" },
    ],
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
    code: "CO",
    country: "Colombia",
    flag: "🇨🇴",
    services: [
      { label: "Police", number: "112" },
      { label: "Ambulance", number: "125" },
      { label: "Fire", number: "119" },
      { label: "General emergency", number: "123" },
    ],
  },
  {
    code: "EG",
    country: "Egypt",
    flag: "🇪🇬",
    services: [
      { label: "Police", number: "122" },
      { label: "Ambulance", number: "123" },
      { label: "Fire", number: "180" },
    ],
  },
  {
    code: "EC",
    country: "Ecuador",
    flag: "🇪🇨",
    services: [
      { label: "Police", number: "122" },
      { label: "Ambulance", number: "123" },
      { label: "General emergency", number: "911" },
    ],
  },
  {
    code: "FR",
    country: "France",
    flag: "🇫🇷",
    services: [{ label: "General emergency", number: "112" }],
  },
  {
    code: "DE",
    country: "Germany",
    flag: "🇩🇪",
    services: [{ label: "General emergency", number: "112" }],
  },
  {
    code: "GH",
    country: "Ghana",
    flag: "🇬🇭",
    services: [
      { label: "Police", number: "191" },
      { label: "Ambulance", number: "192" },
      { label: "Fire", number: "193" },
      { label: "General emergency", number: "999" },
    ],
  },
  {
    code: "HK",
    country: "Hong Kong",
    flag: "🇭🇰",
    services: [{ label: "General emergency", number: "999" }],
  },
  {
    code: "IN",
    country: "India",
    flag: "🇮🇳",
    services: [
      { label: "Police", number: "100" },
      { label: "Ambulance", number: "102" },
      { label: "Fire", number: "101" },
    ],
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
      { label: "Police", number: "110" },
      { label: "Ambulance / Fire", number: "119" },
    ],
  },
  {
    code: "KE",
    country: "Kenya",
    flag: "🇰🇪",
    services: [
      { label: "Police", number: "112" },
      { label: "Ambulance", number: "112" },
      { label: "Fire", number: "112" },
      { label: "General emergency", number: "999" },
    ],
  },
  {
    code: "KR",
    country: "South Korea",
    flag: "🇰🇷",
    services: [
      { label: "Police", number: "112" },
      { label: "Ambulance", number: "119" },
      { label: "Fire", number: "119" },
    ],
  },
  {
    code: "MX",
    country: "Mexico",
    flag: "🇲🇽",
    services: [{ label: "General emergency", number: "911" }],
  },
  {
    code: "MA",
    country: "Morocco",
    flag: "🇲🇦",
    services: [
      { label: "Police", number: "19" },
      { label: "Ambulance", number: "15" },
    ],
  },
  {
    code: "NZ",
    country: "New Zealand",
    flag: "🇳🇿",
    services: [{ label: "General emergency", number: "111" }],
  },
  {
    code: "NG",
    country: "Nigeria",
    flag: "🇳🇬",
    services: [
      { label: "Police", number: "199" },
      { label: "Ambulance", number: "199" },
      { label: "Fire", number: "199" },
      { label: "General emergency", number: "112" },
    ],
  },
  {
    code: "PE",
    country: "Peru",
    flag: "🇵🇪",
    services: [
      { label: "Police", number: "105" },
      { label: "Ambulance", number: "106" },
      { label: "Fire", number: "116" },
    ],
  },
  {
    code: "ZA",
    country: "South Africa",
    flag: "🇿🇦",
    services: [
      { label: "Police", number: "10111" },
      { label: "Ambulance", number: "10177" },
      { label: "Fire", number: "10111" },
      { label: "General emergency", number: "112" },
    ],
  },
  {
    code: "ES",
    country: "Spain",
    flag: "🇪🇸",
    services: [{ label: "General emergency", number: "112" }],
  },
  {
    code: "TW",
    country: "Taiwan",
    flag: "🇹🇼",
    services: [
      { label: "Police", number: "110" },
      { label: "Ambulance / Fire", number: "119" },
    ],
  },
  {
    code: "TN",
    country: "Tunisia",
    flag: "🇹🇳",
    services: [
      { label: "Police", number: "197" },
      { label: "Ambulance", number: "190" },
      { label: "Fire", number: "198" },
    ],
  },
  {
    code: "UG",
    country: "Uganda",
    flag: "🇺🇬",
    services: [{ label: "General emergency", number: "999" }],
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
  {
    code: "UY",
    country: "Uruguay",
    flag: "🇺🇾",
    services: [{ label: "General emergency", number: "911" }],
  },
  {
    code: "VE",
    country: "Venezuela",
    flag: "🇻🇪",
    services: [
      { label: "Police", number: "171" },
      { label: "Ambulance", number: "171" },
      { label: "Fire", number: "171" },
    ],
  },
  {
    code: "ZW",
    country: "Zimbabwe",
    flag: "🇿🇼",
    services: [
      { label: "Police", number: "995" },
      { label: "Ambulance", number: "994" },
      { label: "Fire", number: "993" },
      { label: "General emergency", number: "999" },
    ],
  },
].sort((a, b) => a.country.localeCompare(b.country));
