import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { API_CONFIG } from './api/config'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: API_CONFIG.BASE_URL,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})