import process from 'node:process'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import Icons from 'unplugin-icons/vite'
import { defineConfig, loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const env = loadEnv('all', process.cwd())
const apiUrl = env.VITE_API_URL as string

export default defineConfig({
  plugins: [
    Icons({
      compiler: 'jsx',
      jsx: 'react',
      autoInstall: true,
    }),
    TanStackRouterVite({
      quoteStyle: 'single',
      semicolons: false,
    }),
    react(),
    tsconfigPaths(),
  ],
  server: {
    port: 3500,
    proxy: {
      '/api': {
        target: apiUrl,
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
})
