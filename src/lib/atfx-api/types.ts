/** ATFX Salesforce REST API — mirrors SalesforceATFX_mcp /api contract */

export interface AtfxApiEnvelope<T> {
  data: T
  meta?: AtfxMeta
}

export interface AtfxMeta {
  soql?: string | string[]
  queryLocator?: string
  warnings?: string[]
  truncated?: boolean
  hints?: string[]
  cached?: boolean
  period?: string
  days?: number
  [key: string]: unknown
}

export interface AtfxOrg {
  username: string
  alias: string
  instanceUrl: string
  orgId: string
  apiVersion: string
  connectedStatus: string
}

export interface AtfxApiIndex {
  name: string
  version: string
  endpoints: Array<{
    method: string
    path: string
    kind?: 'shortcut'
  }>
}

export interface SfRecord {
  attributes?: { type: string; url?: string }
  Id?: string
  Name?: string
  [key: string]: unknown
}

export interface SfQueryResult {
  records: SfRecord[]
  totalSize?: number
  done?: boolean
  nextRecordsUrl?: string
}

export interface AggregateRow {
  Name?: string
  Status?: string
  Country_of_Residence_Lead__c?: string
  cnt?: number
  [key: string]: unknown
}

export interface ConversionRate {
  total: number
  converted: number
  rate: number
}

export interface DescribeResult {
  name: string
  label?: string
  mode: string
  fieldCount: number
  cached: boolean
  fields: Array<{
    name: string
    label: string
    type: string
    picklistValues?: Array<{ value: string; label: string; active: boolean }>
  }>
}

export interface AggregateParams {
  object: string
  groupBy: string[]
  metric?: 'count'
  period?: string
  days?: number
  filters?: Record<string, string | boolean | number>
  orderBy?: 'asc' | 'desc'
  limit?: number
}

export interface SearchParams {
  object: string
  email?: string
  name?: string
  status?: string
  country?: string
  ownerName?: string
  days?: number
  limit?: number
}

export interface SoqlQueryParams {
  query?: string
  queryLocator?: string
  maxRecords?: number
}