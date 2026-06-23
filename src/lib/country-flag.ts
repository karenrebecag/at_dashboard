/** ISO-3 (Salesforce picklist) → ISO-2 for regional-indicator flag emojis. */
export const ISO3_TO_ISO2: Record<string, string> = {
  MEX: 'MX',
  COL: 'CO',
  PER: 'PE',
  ECU: 'EC',
  BOL: 'BO',
  ARG: 'AR',
  CHL: 'CL',
  PRY: 'PY',
  CRI: 'CR',
  ZAF: 'ZA',
  URY: 'UY',
  BRA: 'BR',
  VEN: 'VE',
  DOM: 'DO',
  SLV: 'SV',
  MYS: 'MY',
  CAN: 'CA',
  ARE: 'AE',
  NIC: 'NI',
  USA: 'US',
  JAM: 'JM',
  GBR: 'GB',
  HND: 'HN',
  GTM: 'GT',
  PAN: 'PA',
  BRB: 'BB',
  MTQ: 'MQ',
  CUB: 'CU',
  AIA: 'AI',
  HTI: 'HT',
  JOR: 'JO',
  AFG: 'AF',
  DMA: 'DM',
  JPN: 'JP',
  KOR: 'KR',
  SGP: 'SG',
  ASM: 'AS',
  GUF: 'GF',
  IDN: 'ID',
  FRA: 'FR',
  BLZ: 'BZ',
  ESP: 'ES',
  DEU: 'DE',
  ITA: 'IT',
  PRT: 'PT',
  CHN: 'CN',
  IND: 'IN',
  AUS: 'AU',
}

export function iso3ToIso2(iso3: string): string | undefined {
  const key = iso3.trim().toUpperCase()
  if (key.length === 0 || key === '—') return undefined
  return ISO3_TO_ISO2[key]
}

/** Regional-indicator flag emoji from ISO-3; falls back to the code when unknown. */
export function countryFlagEmoji(iso3: string): string {
  const iso2 = iso3ToIso2(iso3)
  if (!iso2 || iso2.length !== 2) return iso3

  const codePoints = [...iso2.toUpperCase()].map(
    (char) => 0x1f1e6 + char.charCodeAt(0) - 65,
  )
  return String.fromCodePoint(...codePoints)
}

export function countryFlagLabel(iso3: string): string {
  const flag = countryFlagEmoji(iso3)
  return flag === iso3 ? iso3 : `${flag} ${iso3}`
}