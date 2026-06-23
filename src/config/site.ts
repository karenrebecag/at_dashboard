/** Single source of truth for app identity — keep in sync with package.json + index.html */
export const siteConfig = {
  name: 'Sales Intelligence',
  shortName: 'ATFX',
  tagline: 'Live leads, accounts & BDM performance from Salesforce',
  description:
    'Internal dashboard for ATFX brokerage CRM — live leads, BDM performance, conversion, and record search via the SalesforceATFX REST API.',
  version: '0.3.0',
  locale: 'en',
  brand: {
    /** Hex values from https://www.atfx.com/es/ */
    colors: {
      navy: '#0f2c52',
      orange: '#f2672a',
      ink: '#24282d',
      muted: '#666666',
      surface: '#f5f5f5',
      border: '#e2e2e2',
      /** UI blue highlight + depth scale — anchored on navy */
      highlight: '#3d8fd4',
      /** Inverted: 50 = darkest, 700 = lightest; highlight stays at 400 */
      blueScale: {
        50: '#071829',
        100: '#0f2c52',
        200: '#164a7a',
        300: '#1e63a8',
        400: '#3d8fd4',
        500: '#7eb8f0',
        600: '#c5ddf8',
        700: '#edf4fc',
      },
    },
    logos: {
      blue: '/images/atfx/logo-blue.webp',
      white: '/images/atfx/logo-white.webp',
    },
    favicon: '/images/atfx/favicon.png',
  },
  api: {
    product: 'SalesforceATFX_mcp',
    docsPath: '/atfx/explore',
  },
  links: {
    mcpHealth: 'https://atfxmcp.westus2.cloudapp.azure.com/health',
    website: 'https://www.atfx.com/es/',
  },
} as const

export function pageTitle(segment?: string): string {
  if (!segment) return siteConfig.name
  return `${segment} · ${siteConfig.name}`
}