// HARDCODED — per-BDM Net Deposit and Lots (latest report).
// Values are APPROXIMATED from the source screenshot (bars not labelled); collapsed
// to unique BDMs. MIBs / Active IBs are NOT here — those reuse ib-activation-data.

export interface BdmMetricDatum {
  bdm: string
  value: number
}

export const NET_DEPOSIT_BY_BDM: BdmMetricDatum[] = [
  { bdm: 'Rafael Caballero', value: 110000 },
  { bdm: 'Alejandro Granados', value: 35000 },
  { bdm: 'Joel Flores', value: 30000 },
  { bdm: 'Yennifer Caballero', value: 24000 },
  { bdm: 'Juan Tachack', value: 22000 },
  { bdm: 'Nicole Coronel', value: 13000 },
  { bdm: 'Gerardo Sanchez', value: 11000 },
  { bdm: 'Danilo Romero', value: 8000 },
]

export const LOTS_BY_BDM: BdmMetricDatum[] = [
  { bdm: 'Gerardo Sanchez', value: 370 },
  { bdm: 'Alejandro Granados', value: 250 },
  { bdm: 'Joel Flores', value: 175 },
  { bdm: 'Rafael Caballero', value: 150 },
  { bdm: 'Juliana Alonso', value: 140 },
  { bdm: 'Joao Sandi', value: 130 },
]
