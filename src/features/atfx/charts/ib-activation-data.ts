// HARDCODED — "Best IB Activation Performance" report (latest, not yet in Salesforce).
// This is the ONLY hardcoded data in the BDM leaderboard; everything else is dynamic.
// Source report had per-MIB rows; collapsed here to one row per BDM (MIBs/Active IBs summed).
// Joined to the live leaderboard by BDM name — update the names if Salesforce Owner names differ.

export type RecognitionTier =
  | 'Top Performer'
  | 'Recognition'
  | 'Growth Contribution'
  | 'No Recognition'

export interface IbActivation {
  mibs: number
  activeIbs: number
  recognition: RecognitionTier
}

// Keyed by BDM name as it appears in Salesforce Owner.Name.
const IB_ACTIVATION_BY_BDM: Record<string, IbActivation> = {
  'Joel Flores': { mibs: 2, activeIbs: 7, recognition: 'Recognition' },
  'Danilo Romero': { mibs: 4, activeIbs: 6, recognition: 'Recognition' },
  'Sergio Vargas': { mibs: 3, activeIbs: 4, recognition: 'Recognition' },
  'Antonio Perea': { mibs: 1, activeIbs: 1, recognition: 'Growth Contribution' },
  'Nicole Coronel': { mibs: 2, activeIbs: 2, recognition: 'Growth Contribution' },
  'Gerardo Sanchez': { mibs: 6, activeIbs: 3, recognition: 'Growth Contribution' },
  'Juan Tachack': { mibs: 3, activeIbs: 1, recognition: 'Growth Contribution' },
  'Alejandro Granados': { mibs: 10, activeIbs: 3, recognition: 'Top Performer' },
  'Carmen Jimenez': { mibs: 7, activeIbs: 1, recognition: 'Recognition' },
}

// Case/whitespace-insensitive lookup so minor Owner.Name variations still match.
const NORMALIZED = new Map<string, IbActivation>(
  Object.entries(IB_ACTIVATION_BY_BDM).map(([name, data]) => [
    name.trim().toLowerCase(),
    data,
  ]),
)

export function getIbActivation(bdmName: string): IbActivation | undefined {
  return NORMALIZED.get(bdmName.trim().toLowerCase())
}

// Flat list for per-BDM charts (MIBs / Active IBs by BDM).
export const IB_ACTIVATION_ENTRIES: Array<{ name: string } & IbActivation> =
  Object.entries(IB_ACTIVATION_BY_BDM).map(([name, data]) => ({ name, ...data }))

// Active IBs / MIBs as a fraction (e.g. 7/2 = 3.5 → 350%). Null when no MIBs to rate against.
export function activationRate(data: IbActivation): number | null {
  if (data.mibs <= 0) return null
  return data.activeIbs / data.mibs
}
