export const atfxKeys = {
  all: ['atfx'] as const,
  index: () => [...atfxKeys.all, 'index'] as const,
  org: () => [...atfxKeys.all, 'org'] as const,
  schema: () => [...atfxKeys.all, 'schema'] as const,
  schemaSection: (section: string) => [...atfxKeys.all, 'schema', section] as const,
  describe: (sobject: string, mode?: string) =>
    [...atfxKeys.all, 'describe', sobject, mode ?? 'curated'] as const,
  picklists: (object: string) => [...atfxKeys.all, 'picklists', object] as const,
  aggregate: (params: unknown) => [...atfxKeys.all, 'aggregate', params] as const,
  search: (params: unknown) => [...atfxKeys.all, 'search', params] as const,
  record: (object: string, id: string, fields?: string) =>
    [...atfxKeys.all, 'record', object, id, fields ?? ''] as const,
  query: (params: unknown) => [...atfxKeys.all, 'query', params] as const,
  leadsByBdm: (period: string) => [...atfxKeys.all, 'leads', 'by-bdm', period] as const,
  leadsByBdmAllTime: (limit: number) =>
    [...atfxKeys.all, 'leads', 'by-bdm-all-time', limit] as const,
  leadsByCountry: (days: number) => [...atfxKeys.all, 'leads', 'by-country', days] as const,
  conversionRate: (days: number) => [...atfxKeys.all, 'leads', 'conversion', days] as const,
  leadsByStatus: (days: number, country?: string) =>
    [...atfxKeys.all, 'leads', 'by-status', days, country ?? ''] as const,
  leadsTrend: (days: number) => [...atfxKeys.all, 'leads', 'trend', days] as const,
  leadsTrendConverted: (days: number) =>
    [...atfxKeys.all, 'leads', 'trend-converted', days] as const,
  accountsByBdm: (limit: number) => [...atfxKeys.all, 'accounts', 'by-bdm', limit] as const,
  accountsByCountry: (limit: number) =>
    [...atfxKeys.all, 'accounts', 'by-country', limit] as const,
  newAccounts: (days: number) =>
    [...atfxKeys.all, 'accounts', 'new', days] as const,
}