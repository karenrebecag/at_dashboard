/** Shared fetch limit — one query powers KPI card + accounts table */
export const ACCOUNTS_BDM_FETCH_LIMIT = 50

/** Shared fetch limit — one query powers the hot-leads KPI count + the list,
 *  so both share a single queryKey instead of firing two near-identical searches. */
export const HOT_LEADS_FETCH_LIMIT = 100