/**
 * Choropleth buckets for Leads by country.
 * Inverted blue cluster: 50 = darkest → 700 = lightest.
 * Fewer leads use lighter tokens; more leads step into darker blues.
 */
export const LEADS_COUNTRY_MAP_BUCKETS = [
  { level: 1, token: 'highlight-700', swatchClass: 'bg-highlight-700' },
  { level: 2, token: 'highlight-600', swatchClass: 'bg-highlight-600' },
  { level: 3, token: 'highlight-500', swatchClass: 'bg-highlight-500' },
  { level: 4, token: 'highlight-400', swatchClass: 'bg-highlight-400' },
  { level: 5, token: 'highlight-200', swatchClass: 'bg-highlight-200' },
] as const

export type LeadsCountryMapLevel = (typeof LEADS_COUNTRY_MAP_BUCKETS)[number]['level']

export function leadsCountryMapClass(level: number): string {
  const clamped = Math.min(5, Math.max(1, level)) as LeadsCountryMapLevel
  return `lc-${clamped}`
}