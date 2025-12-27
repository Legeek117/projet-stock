import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// URL du backend (Cloudflare Tunnel)
const BACKEND_URL = 'https://urge-forge-expenditures-systematic.trycloudflare.com/projet-stock';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: BACKEND_URL,
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
