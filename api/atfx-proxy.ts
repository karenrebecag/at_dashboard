import type { VercelRequest, VercelResponse } from '@vercel/node'
import { readCachedResponse, writeCachedResponse } from './_lib/cache-store.js'
import {
  buildUpstreamUrl,
  queryWithoutPath,
  readUpstreamConfig,
} from './_lib/upstream.js'

const CACHEABLE_METHODS = new Set(['GET', 'POST'])
const UPSTREAM_TIMEOUT_MS = 90_000

function setCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Accept, X-ATFX-Bypass-Cache',
  )
}

function bypassCache(req: VercelRequest): boolean {
  const header = req.headers['x-atfx-bypass-cache']
  return header === '1' || header === 'true'
}

function postBody(req: VercelRequest): string | undefined {
  if (req.method !== 'POST') return undefined
  if (req.body == null || req.body === '') return undefined
  return typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
}

// Subpath comes from the vercel.json rewrite (/api/atfx/:path* -> ?path=...)
function apiPathFromReq(req: VercelRequest): string {
  const raw = req.query.path
  const joined = Array.isArray(raw) ? raw.join('/') : (raw ?? '')
  const segments = joined.split('/').filter(Boolean)
  return segments.length ? `/api/${segments.join('/')}` : '/api'
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  setCors(res)

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({
      error: 'method_not_allowed',
      message: 'Only GET and POST are supported',
    })
    return
  }

  const upstream = readUpstreamConfig()
  if (!upstream) {
    res.status(503).json({
      error: 'upstream_not_configured',
      message:
        'Set ATFX_UPSTREAM_URL and ATFX_UPSTREAM_TOKEN in the deployment environment',
    })
    return
  }

  const apiPath = apiPathFromReq(req)
  const query = queryWithoutPath(req.query)
  const upstreamUrl = buildUpstreamUrl(upstream.origin, apiPath, query)
  const method = req.method
  const body = postBody(req)
  const skipCache = bypassCache(req)

  if (CACHEABLE_METHODS.has(method) && !skipCache) {
    const hit = await readCachedResponse(method, apiPath, query, body)
    if (hit) {
      res.setHeader('X-ATFX-Cache', 'HIT')
      res.setHeader('Content-Type', hit.contentType)
      res.status(hit.status).send(hit.body)
      return
    }
  }

  let upstreamRes: Response
  try {
    upstreamRes = await fetch(upstreamUrl, {
      method,
      headers: {
        Authorization: `Bearer ${upstream.token}`,
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body,
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upstream request failed'
    console.error('ATFX BFF upstream error:', message)
    res.status(502).json({ error: 'upstream_error', message })
    return
  }

  const responseBody = await upstreamRes.text()
  const contentType =
    upstreamRes.headers.get('content-type') ?? 'application/json'

  res.setHeader('X-ATFX-Cache', skipCache ? 'BYPASS' : 'MISS')
  res.setHeader('Content-Type', contentType)

  if (CACHEABLE_METHODS.has(method) && !skipCache && upstreamRes.ok) {
    await writeCachedResponse(
      method,
      apiPath,
      query,
      body,
      { status: upstreamRes.status, body: responseBody, contentType },
      upstream.cacheTtlSec,
    )
  }

  res.status(upstreamRes.status).send(responseBody)
}
