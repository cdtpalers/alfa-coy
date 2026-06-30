import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'logo-graphic.png', 'logo.webp', '**/*.webp', '**/*.svg', '**/*.csv'],
      manifest: {
        name: 'ALFA Company Dashboard',
        short_name: 'ALFA Coy',
        description: 'Dashboard for ALFA Company Cadet Corps',
        theme_color: '#121212',
        background_color: '#121212',
        display: 'standalone',
        icons: [
          {
            src: 'logo-graphic.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo-graphic.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,csv}'],
        maximumFileSizeToCacheInBytes: 5000000 // 5MB limit to allow large CSV/images
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 1500,
  },
})
