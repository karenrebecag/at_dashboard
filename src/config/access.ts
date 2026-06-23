// Login is gated to these exact accounts after Clerk auth — anyone can sign in
// with Clerk, but only allowlisted emails reach the dashboard.
export const ALLOWED_EMAILS = [
  'karen.ortiz@atfxgm.com',
  'esteban.pinzon@atfxgm.com',
  'guillermo.lara@atfxgm.com',
] as const

export function isAllowedEmail(email?: string | null): boolean {
  if (!email) return false
  return ALLOWED_EMAILS.includes(
    email.trim().toLowerCase() as (typeof ALLOWED_EMAILS)[number],
  )
}
