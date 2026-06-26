// HARDCODED — regional performance report (latest, not yet in Salesforce).
// One block per region; same shape as the source report cards.

export interface RegionMetrics {
  region: string
  activeBdms: number
  avgFinalScore: number
  totalNetDeposit: number
  totalLots: number
  totalMibs: number
  totalActiveIbs: number
}

export const REGION_PERFORMANCE: RegionMetrics[] = [
  {
    region: 'Mexico',
    activeBdms: 9,
    avgFinalScore: 0,
    totalNetDeposit: -158.34,
    totalLots: 1719.2,
    totalMibs: 24,
    totalActiveIbs: 13,
  },
  {
    region: 'Colombia & Peru',
    activeBdms: 22,
    avgFinalScore: 0,
    totalNetDeposit: 146061.73,
    totalLots: 780.99,
    totalMibs: 25,
    totalActiveIbs: 15,
  },
  {
    region: 'LATAM South',
    activeBdms: 13,
    avgFinalScore: 0,
    totalNetDeposit: -146784.01,
    totalLots: 929.8,
    totalMibs: 2,
    totalActiveIbs: 15,
  },
  {
    region: 'Ecuador',
    activeBdms: 3,
    avgFinalScore: 0,
    totalNetDeposit: 8062.59,
    totalLots: 284.24,
    totalMibs: 2,
    totalActiveIbs: 3,
  },
]
