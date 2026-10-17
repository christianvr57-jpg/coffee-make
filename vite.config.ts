/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';
import { compatSafari12 } from './tools/compat-css';

// Rutas relativas: la app funciona igual en local y bajo /coffee-make/ en GitHub Pages.
export default defineConfig({
  base: './',
  define: { __VERSION__: JSON.stringify(process.env.npm_package_version || '2.0.0') },
  plugins: [
    compatSafari12(),
    preact(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false, // se registra a mano en src/core/pwa.ts
      includeAssets: ['icons/apple-touch-icon.png', 'icons/icon-192.png'],
      manifest: {
        name: 'Coffee Make',
        short_name: 'Coffee Make',
        description: 'Tu segundo cerebro: hogar, cocina, running y lo que venga, sin conexión.',
        lang: 'es',
        start_url: './',
        scope: './',
        id: './',
        display: 'standalone',
        orientation: 'any',
        background_color: '#f2f2f7',
        theme_color: '#f2f2f7',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,png,svg,webmanifest}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  // Safari 12: el iPad mini 2 de la nevera (iOS 12). El código se traduce a lo que entiende y el CSS lleva respaldos.
  build: { target: ['es2019', 'safari12'], cssTarget: ['safari12'], sourcemap: true },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
});
