// HARDCODED — "BDMs Who Improved / Dropped" report (latest, not yet in Salesforce).
// Rank movement has no dynamic equivalent (no stored prior snapshot), so the whole
// report is static. Only the rows visible in the source screenshot are captured here.

import type { RecognitionTier } from './ib-activation-data'

export interface BdmMovement {
  name: string
  prevRank: number
  currentRank: number
  score: number
  recognition: RecognitionTier
}

// Positions improved = prevRank - currentRank (positive = moved up the board).
export function movement(row: BdmMovement): number {
  return row.prevRank - row.currentRank
}

export const BDMS_IMPROVED: BdmMovement[] = [
  { name: 'Nicole Coronel', prevRank: 18, currentRank: 1, score: 0, recognition: 'Growth Contribution' },
  { name: 'Juliana Alonso', prevRank: 17, currentRank: 1, score: 0, recognition: 'No Recognition' },
  { name: 'Yanina Blanco', prevRank: 17, currentRank: 1, score: 0, recognition: 'No Recognition' },
  { name: 'Joao Sandi', prevRank: 16, currentRank: 1, score: 0, recognition: 'No Recognition' },
  { name: 'Yennifer Canallero', prevRank: 16, currentRank: 1, score: 0, recognition: 'No Recognition' },
  { name: 'Rafael Caballero', prevRank: 14, currentRank: 1, score: 0, recognition: 'No Recognition' },
  { name: 'Sergio Vargas', prevRank: 14, currentRank: 1, score: 0, recognition: 'No Recognition' },
  { name: 'Maria José Mangione', prevRank: 13, currentRank: 1, score: 0, recognition: 'No Recognition' },
]

export const BDMS_DROPPED: BdmMovement[] = []
