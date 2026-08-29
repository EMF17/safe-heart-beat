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

/**
 * Compact worldwide dataset.
 * Tuple: [ISO code, country name, general, police, ambulance, fire]
 * Empty string = service not published / not applicable for that country.
 * Sources: national emergency authorities + ITU / EENA published numbers.
 */
type Row = [string, string, string, string, string, string];

const ROWS: Row[] = [
  ["AF", "Afghanistan", "", "119", "112", "119"],
  ["AL", "Albania", "112", "129", "127", "128"],
  ["DZ", "Algeria", "", "17", "16", "14"],
  ["AD", "Andorra", "112", "110", "118", "118"],
  ["AO", "Angola", "", "113", "112", "115"],
  ["AG", "Antigua and Barbuda", "911", "", "", ""],
  ["AR", "Argentina", "911", "101", "107", "100"],
  ["AM", "Armenia", "112", "102", "103", "101"],
  ["AU", "Australia", "000", "", "", ""],
  ["AT", "Austria", "112", "133", "144", "122"],
  ["AZ", "Azerbaijan", "112", "102", "103", "101"],
  ["BS", "Bahamas", "911", "", "", ""],
  ["BH", "Bahrain", "999", "", "", ""],
  ["BD", "Bangladesh", "999", "", "", ""],
  ["BB", "Barbados", "911", "211", "511", "311"],
  ["BY", "Belarus", "112", "102", "103", "101"],
  ["BE", "Belgium", "112", "101", "112", "112"],
  ["BZ", "Belize", "911", "", "", ""],
  ["BJ", "Benin", "", "117", "112", "118"],
  ["BM", "Bermuda", "911", "", "", ""],
  ["BT", "Bhutan", "112", "113", "112", "110"],
  ["BO", "Bolivia", "911", "110", "160", "119"],
  ["BA", "Bosnia and Herzegovina", "112", "122", "124", "123"],
  ["BW", "Botswana", "999", "999", "997", "998"],
  ["BR", "Brazil", "", "190", "192", "193"],
  ["BN", "Brunei", "", "993", "991", "995"],
  ["BG", "Bulgaria", "112", "", "", ""],
  ["BF", "Burkina Faso", "", "17", "112", "18"],
  ["BI", "Burundi", "", "117", "112", "118"],
  ["KH", "Cambodia", "", "117", "119", "118"],
  ["CM", "Cameroon", "", "117", "119", "118"],
  ["CA", "Canada", "911", "", "", ""],
  ["CV", "Cape Verde", "", "132", "130", "131"],
  ["TD", "Chad", "", "17", "112", "18"],
  ["CL", "Chile", "", "133", "131", "132"],
  ["CN", "China", "", "110", "120", "119"],
  ["CO", "Colombia", "123", "112", "125", "119"],
  ["CD", "Congo (DRC)", "", "112", "", ""],
  ["CR", "Costa Rica", "911", "", "", ""],
  ["HR", "Croatia", "112", "192", "194", "193"],
  ["CU", "Cuba", "", "106", "104", "105"],
  ["CY", "Cyprus", "112", "199", "199", "199"],
  ["CZ", "Czechia", "112", "158", "155", "150"],
  ["DK", "Denmark", "112", "114", "112", "112"],
  ["DO", "Dominican Republic", "911", "", "", ""],
  ["EC", "Ecuador", "911", "101", "131", "102"],
  ["EG", "Egypt", "", "122", "123", "180"],
  ["SV", "El Salvador", "911", "", "", ""],
  ["EE", "Estonia", "112", "", "", ""],
  ["ET", "Ethiopia", "", "991", "907", "939"],
  ["FJ", "Fiji", "911", "917", "911", "910"],
  ["FI", "Finland", "112", "", "", ""],
  ["FR", "France", "112", "17", "15", "18"],
  ["GA", "Gabon", "", "1730", "1300", "18"],
  ["GM", "Gambia", "", "117", "116", "118"],
  ["GE", "Georgia", "112", "", "", ""],
  ["DE", "Germany", "112", "110", "112", "112"],
  ["GH", "Ghana", "112", "191", "193", "192"],
  ["GR", "Greece", "112", "100", "166", "199"],
  ["GT", "Guatemala", "110", "110", "125", "122"],
  ["GN", "Guinea", "", "117", "112", "118"],
  ["GY", "Guyana", "911", "911", "913", "912"],
  ["HT", "Haiti", "114", "114", "116", "115"],
  ["HN", "Honduras", "911", "", "", ""],
  ["HK", "Hong Kong", "999", "999", "999", "999"],
  ["HU", "Hungary", "112", "107", "104", "105"],
  ["IS", "Iceland", "112", "", "", ""],
  ["IN", "India", "112", "100", "102", "101"],
  ["ID", "Indonesia", "112", "110", "119", "113"],
  ["IR", "Iran", "", "110", "115", "125"],
  ["IQ", "Iraq", "", "104", "122", "115"],
  ["IE", "Ireland", "112", "999", "112", "112"],
  ["IL", "Israel", "", "100", "101", "102"],
  ["IT", "Italy", "112", "113", "118", "115"],
  ["CI", "Ivory Coast", "", "111", "185", "180"],
  ["JM", "Jamaica", "119", "119", "110", "110"],
  ["JP", "Japan", "", "110", "119", "119"],
  ["JO", "Jordan", "911", "", "", ""],
  ["KZ", "Kazakhstan", "112", "102", "103", "101"],
  ["KE", "Kenya", "999", "999", "999", "999"],
  ["KW", "Kuwait", "112", "", "", ""],
  ["KG", "Kyrgyzstan", "112", "102", "103", "101"],
  ["LA", "Laos", "", "191", "195", "190"],
  ["LV", "Latvia", "112", "110", "113", "112"],
  ["LB", "Lebanon", "112", "112", "140", "175"],
  ["LS", "Lesotho", "", "123", "121", "122"],
  ["LR", "Liberia", "911", "", "", ""],
  ["LY", "Libya", "", "1515", "193", "180"],
  ["LI", "Liechtenstein", "112", "117", "144", "118"],
  ["LT", "Lithuania", "112", "", "", ""],
  ["LU", "Luxembourg", "112", "113", "112", "112"],
  ["MO", "Macau", "999", "999", "999", "999"],
  ["MG", "Madagascar", "", "117", "124", "118"],
  ["MW", "Malawi", "997", "997", "998", "999"],
  ["MY", "Malaysia", "999", "999", "999", "994"],
  ["MV", "Maldives", "", "119", "102", "118"],
  ["ML", "Mali", "", "17", "15", "18"],
  ["MT", "Malta", "112", "", "", ""],
  ["MU", "Mauritius", "999", "999", "114", "115"],
  ["MX", "Mexico", "911", "", "", ""],
  ["MD", "Moldova", "112", "", "", ""],
  ["MC", "Monaco", "112", "17", "18", "18"],
  ["MN", "Mongolia", "", "102", "103", "101"],
  ["ME", "Montenegro", "112", "122", "124", "123"],
  ["MA", "Morocco", "", "19", "15", "15"],
  ["MZ", "Mozambique", "", "119", "117", "198"],
  ["MM", "Myanmar", "", "199", "192", "191"],
  ["NA", "Namibia", "", "10111", "211111", "2032270"],
  ["NP", "Nepal", "", "100", "102", "101"],
  ["NL", "Netherlands", "112", "", "", ""],
  ["NZ", "New Zealand", "111", "", "", ""],
  ["NI", "Nicaragua", "", "118", "128", "115"],
  ["NE", "Niger", "", "17", "15", "18"],
  ["NG", "Nigeria", "112", "112", "112", "112"],
  ["MK", "North Macedonia", "112", "192", "194", "193"],
  ["NO", "Norway", "112", "112", "113", "110"],
  ["OM", "Oman", "9999", "", "", ""],
  ["PK", "Pakistan", "15", "15", "1122", "16"],
  ["PA", "Panama", "911", "104", "911", "103"],
  ["PG", "Papua New Guinea", "", "112", "111", "110"],
  ["PY", "Paraguay", "911", "911", "141", "132"],
  ["PE", "Peru", "911", "105", "106", "116"],
  ["PH", "Philippines", "911", "", "", ""],
  ["PL", "Poland", "112", "997", "999", "998"],
  ["PT", "Portugal", "112", "", "", ""],
  ["PR", "Puerto Rico", "911", "", "", ""],
  ["QA", "Qatar", "999", "", "", ""],
  ["RO", "Romania", "112", "", "", ""],
  ["RU", "Russia", "112", "102", "103", "101"],
  ["RW", "Rwanda", "112", "112", "912", "111"],
  ["SA", "Saudi Arabia", "911", "999", "997", "998"],
  ["SN", "Senegal", "", "17", "1515", "18"],
  ["RS", "Serbia", "112", "192", "194", "193"],
  ["SC", "Seychelles", "999", "", "", ""],
  ["SL", "Sierra Leone", "", "999", "999", "999"],
  ["SG", "Singapore", "999", "999", "995", "995"],
  ["SK", "Slovakia", "112", "158", "155", "150"],
  ["SI", "Slovenia", "112", "113", "112", "112"],
  ["SO", "Somalia", "", "888", "999", "555"],
  ["ZA", "South Africa", "112", "10111", "10177", "10177"],
  ["KR", "South Korea", "", "112", "119", "119"],
  ["ES", "Spain", "112", "091", "061", "080"],
  ["LK", "Sri Lanka", "119", "119", "1990", "110"],
  ["SD", "Sudan", "999", "999", "333", "998"],
  ["SE", "Sweden", "112", "", "", ""],
  ["CH", "Switzerland", "112", "117", "144", "118"],
  ["SY", "Syria", "", "112", "110", "113"],
  ["TW", "Taiwan", "", "110", "119", "119"],
  ["TJ", "Tajikistan", "112", "102", "103", "101"],
  ["TZ", "Tanzania", "112", "112", "114", "114"],
  ["TH", "Thailand", "191", "191", "1669", "199"],
  ["TT", "Trinidad and Tobago", "999", "999", "811", "990"],
  ["TN", "Tunisia", "", "197", "190", "198"],
  ["TR", "Turkey", "112", "", "", ""],
  ["TM", "Turkmenistan", "", "102", "103", "101"],
  ["UG", "Uganda", "999", "999", "911", "999"],
  ["UA", "Ukraine", "112", "102", "103", "101"],
  ["AE", "United Arab Emirates", "999", "999", "998", "997"],
  ["GB", "United Kingdom", "999", "999", "999", "999"],
  ["US", "United States", "911", "", "", ""],
  ["UY", "Uruguay", "911", "911", "105", "104"],
  ["UZ", "Uzbekistan", "112", "102", "103", "101"],
  ["VE", "Venezuela", "911", "171", "171", "171"],
  ["VN", "Vietnam", "", "113", "115", "114"],
  ["YE", "Yemen", "", "194", "191", "191"],
  ["ZM", "Zambia", "999", "999", "992", "993"],
  ["ZW", "Zimbabwe", "999", "995", "994", "993"],
];

/** Turn an ISO 3166-1 alpha-2 code into its flag emoji. */
export function flagFor(code: string): string {
  return code
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

export const emergencyNumbers: CountryEmergency[] = ROWS.map(
  ([code, country, general, police, ambulance, fire]) => {
    const services: EmergencyService[] = [];
    if (general) services.push({ label: "General emergency", number: general });
    if (police) services.push({ label: "Police", number: police });
    if (ambulance) services.push({ label: "Ambulance", number: ambulance });
    if (fire) services.push({ label: "Fire", number: fire });
    return { code, country, flag: flagFor(code), services };
  },
).sort((a, b) => a.country.localeCompare(b.country));

export const COUNTRY_COUNT = emergencyNumbers.length;

/** Widely-recognised fallbacks when a country isn't in the list or a local number fails. */
export const GLOBAL_FALLBACKS: EmergencyService[] = [
  { label: "GSM mobile emergency (most networks)", number: "112" },
  { label: "Americas / Asia-Pacific common", number: "911" },
];
