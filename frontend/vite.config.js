import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Keep tooling in /frontend, but serve from repo root.
const repoRoot = path.resolve(__dirname, '..')

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')
  const base = env.VITE_PUBLIC_BASE || '/'

  return {
    root: repoRoot,
    envDir: __dirname,
    base,
    publicDir: path.resolve(__dirname, 'public'),
    plugins: [react()],
    server: {
      // Needed for ngrok (and other tunnel hosts) during testing.
      // For production builds, this has no effect.
      allowedHosts: true,
      fs: {
        allow: [repoRoot],
      },
    },
  }
})
