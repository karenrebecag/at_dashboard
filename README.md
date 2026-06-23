# ATFX Dashboard

Internal web dashboard for the ATFX brokerage Salesforce org. Live lead pipeline KPIs, BDM rankings, conversion metrics, and CRM record search — backed by the [SalesforceATFX_mcp](https://github.com/) REST API (`/api`).

**Stack:** React 19 · Vite · TanStack Router & Query · Tailwind 4 · shadcn/ui · Clerk auth · Vercel BFF

## Features

| Area | Description |
|------|-------------|
| **Dashboard** (`/`) | KPIs, pipeline funnel by Status, top BDMs, leads by country |
| **Search** (`/atfx/search`) | Parameterized Lead / Account / Contact search + record detail drawer |
| **API explorer** (`/atfx/explore`) | Live endpoint catalog and org metadata |

Filters (`days`, `period`, `country`) sync to the URL and drive all dashboard widgets.

## Architecture

```
Browser (dashboard)
  → /api/atfx/*          Vercel BFF (Runtime Cache, 5 min TTL)
      → VM /api/*        SalesforceATFX_mcp (sf CLI + optional Redis)
          → Salesforce

Claude web MCP → VM /mcp only (unchanged)
```

The browser **never** holds the `MCP_ACCESS_TOKEN`. Vercel Functions proxy to the Azure VM and cache responses at the edge. The VM remains the Salesforce gateway (no Connected App OAuth).

## Prerequisites

- Node 20+
- [pnpm](https://pnpm.io/)
- Clerk application (publishable key)
- Running [SalesforceATFX_mcp](https://atfxmcp.westus2.cloudapp.azure.com/health) with a valid `MCP_ACCESS_TOKEN`

## Setup (local)

```bash
pnpm install
cp .env.example .env
# VITE_CLERK_PUBLISHABLE_KEY + ATFX_UPSTREAM_TOKEN (server-side, not VITE_*)
pnpm dev
```

Open `http://localhost:5173`. Vite proxies `/api/atfx` → VM `/api` with the Bearer token from `.env`.

To exercise the full Vercel BFF locally (including Runtime Cache):

```bash
pnpm dev:vercel
```

## Deploy (Vercel)

1. Import the repo in Vercel (framework preset: Vite).
2. Set **environment variables** (Production + Preview):

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Yes | Clerk authentication |
| `ATFX_UPSTREAM_URL` | Yes | VM origin, e.g. `https://atfxmcp.westus2.cloudapp.azure.com` |
| `ATFX_UPSTREAM_TOKEN` | Yes | Same as `MCP_ACCESS_TOKEN` on the VM — **server-only** |
| `ATFX_CACHE_TTL_MS` | No | BFF cache TTL (default `300000` = 5 min) |

3. Deploy. The dashboard calls `/api/atfx/*` on the same origin.

Manual **Refresh** in the UI sends `X-ATFX-Bypass-Cache` to skip the BFF cache and refetch from Salesforce via the VM.

## Environment (client)

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Yes | Clerk authentication |
| `VITE_ATFX_USE_BFF` | No | Default `true` — use `/api/atfx` proxy |
| `VITE_ATFX_API_BASE` | No | BFF path prefix (default `/api/atfx`) |
| `VITE_ATFX_QUERY_STALE_MS` | No | TanStack Query stale time (default `60000`) |
| `VITE_ATFX_DASHBOARD_STALE_MS` | No | Dashboard stale time (default `300000`) |

### Legacy direct mode

Set `VITE_ATFX_USE_BFF=false` and use `VITE_ATFX_API_URL` + `VITE_ATFX_API_TOKEN` to call the VM from the browser (not recommended — token ships in the bundle).

## Scripts

```bash
pnpm dev          # Vite dev server (proxies /api/atfx → VM)
pnpm dev:vercel   # Vercel dev (BFF + cache)
pnpm build        # Production build
pnpm preview      # Preview production build
pnpm test         # Vitest (browser mode)
pnpm lint         # ESLint
```

## Code layout

```
api/
  atfx/[...path].ts   # Vercel BFF — proxy + Runtime Cache
  _lib/               # upstream + cache helpers
src/
  lib/atfx-api/       # REST client + TanStack Query hooks
  features/atfx/      # Salesforce widgets and filters
```

## Related

- **API server:** `SalesforceATFX_mcp` — MCP on VM; REST shared with BFF upstream
- **Health check:** `GET https://atfxmcp.westus2.cloudapp.azure.com/health`

## License

MIT — UI scaffold derived from [shadcn-admin](https://github.com/satnaing/shadcn-admin); ATFX integration and data layer are project-specific.