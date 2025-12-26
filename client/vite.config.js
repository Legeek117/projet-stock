import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// URL du backend fournie par l'utilisateur
const BACKEND_URL = 'http://development-moved-favour-cup.trycloudflare.com:8080/projet-stock';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: BACKEND_URL,
        changeOrigin: true,
        secure: false,
        // Si le backend attend /api, on garde /api.
        // Si /projet-stock pointe vers la racine du serveur Express, alors :
        // localhost/api/products -> BACKEND_URL/api/products
        // Cela semble correct car server.js définit app.use('/api/products', ...)
      }
    }
  }
})
