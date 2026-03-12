import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://localhost:8000',
      '/news': 'http://localhost:8000',
      '/sentiment': 'http://localhost:8000',
      '/report': 'http://localhost:8000',
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-ui': ['axios', 'react-hot-toast', 'lucide-react'],
        }
      }
    }
  }
})
