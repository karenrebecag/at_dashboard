// HARDCODED — recognition mix across the full BDM population (latest report).
// Distribution is from the complete dataset, so it is not derived from the
// partial rows captured elsewhere; kept as its own isolated block.

import type { RecognitionTier } from './ib-activation-data'

export interface RecognitionSlice {
  tier: RecognitionTier
  key: string
  percent: number
  color: string
}

export const RECOGNITION_DISTRIBUTION: RecognitionSlice[] = [
  { tier: 'No Recognition', key: 'noRecognition', percent: 60, color: 'var(--chart-1)' },
  { tier: 'Recognition', key: 'recognition', percent: 23, color: 'var(--highlight-200)' },
  { tier: 'Growth Contribution', key: 'growthContribution', percent: 13, color: 'var(--chart-2)' },
  { tier: 'Top Performer', key: 'topPerformer', percent: 4, color: 'var(--highlight)' },
]
