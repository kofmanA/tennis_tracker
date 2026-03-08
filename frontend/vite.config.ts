import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:5101',
        changeOrigin: true,
        secure: false,
      },
      '/admin': {
        target: 'http://localhost:5101',
        changeOrigin: true,
        secure: false,
      },
      '/sessions': {
        target: 'http://localhost:5101',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
