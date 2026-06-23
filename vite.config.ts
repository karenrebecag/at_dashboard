/// <reference types="vitest/config" />
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { playwright } from '@vitest/browser-playwright'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const upstreamUrl =
    env.ATFX_UPSTREAM_URL ??
    env.VITE_ATFX_API_URL ??
    'https://atfxmcp.westus2.cloudapp.azure.com'
  const upstreamToken = env.ATFX_UPSTREAM_TOKEN ?? env.VITE_ATFX_API_TOKEN ?? ''

  return {
    plugins: [
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
      }),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api/atfx': {
          target: upstreamUrl.replace(/\/$/, ''),
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/atfx/, '/api'),
          secure: true,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (upstreamToken) {
                proxyReq.setHeader('Authorization', `Bearer ${upstreamToken}`)
              }
            })
          },
        },
      },
    },
    test: {
      silent: 'passed-only',
      unstubEnvs: true,
      browser: {
        enabled: true,
        provider: playwright(),
        instances: [{ browser: 'chromium' }],
      },
      coverage: {
        exclude: [
          'src/components/ui/**',
          'src/assets/**',
          'src/tanstack-table.d.ts',
          'src/routeTree.gen.ts',
          'src/test-utils/**',
          'src/routes/**',
        ],
      },
    },
  }
})