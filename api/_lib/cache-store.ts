import { createHash } from 'node:crypto'
import { getCache } from '@vercel/functions'

export interface CachedResponse {
  status: number
  body: string
  contentType: string
}

const CACHE_NAMESPACE = 'atfx-bff'

function cacheKey(
  method: string,
  apiPath: string,
  query: URLSearchParams,
  body?: string,
): string {
  const raw = `${method}:${apiPath}:${query.toString()}:${body ?? ''}`
  return createHash('sha256').update(raw).digest('hex')
}

export async function readCachedResponse(
  method: string,
  apiPath: string,
  query: URLSearchParams,
  body?: string,
): Promise<CachedResponse | null> {
  try {
    const cache = getCache({ namespace: CACHE_NAMESPACE })
    const hit = await cache.get<CachedResponse>(
      cacheKey(method, apiPath, query, body),
    )
    return hit ?? null
  } catch (err) {
    console.error('ATFX BFF cache read failed:', err)
    return null
  }
}

export async function writeCachedResponse(
  method: string,
  apiPath: string,
  query: URLSearchParams,
  body: string | undefined,
  value: CachedResponse,
  ttlSec: number,
): Promise<void> {
  try {
    const cache = getCache({ namespace: CACHE_NAMESPACE })
    await cache.set(cacheKey(method, apiPath, query, body), value, {
      ttl: ttlSec,
      tags: ['atfx'],
      name: 'atfx-api-proxy',
    })
  } catch (err) {
    console.error('ATFX BFF cache write failed:', err)
  }
}