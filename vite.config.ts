import legacy from "@vitejs/plugin-legacy";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // Exponer en la red local para probar en dispositivos móviles
  server: {
    host: true,
  },
  plugins: [
    react(),
    // Plugin Legacy: Genera bundles compatibles con navegadores antiguos
    // Inyecta polyfills automáticamente para ES6+, Promises, async/await, etc.
    legacy({
      // Navegadores objetivo para el bundle legacy
      targets: [
        "defaults",
        "not IE 11",
        "> 0.5%",
        "last 2 versions",
        "Firefox ESR",
        "iOS >= 12",
        "Safari >= 12",
        "Chrome >= 64",
      ],
      // Incluir polyfills para características modernas
      additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
      // Generar bundle moderno también (ES modules para navegadores modernos)
      modernPolyfills: true,
    }),
    // Plugin PWA: Service Worker y manifest para instalación móvil
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "logo_orbita_sinfondo.png",
        "logo_orbita.png",
        "logo-header.png",
        "logo-header.webp",
      ],
      manifest: false, // Usamos nuestro propio manifest.json en public/
      workbox: {
        // Cachear assets estáticos
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff,woff2}"],
        // Límite de tamaño para precaching (5MB)
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // Runtime caching para API de Supabase
        runtimeCaching: [
          {
            urlPattern: /^(?!.*\/auth\/)https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 horas
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false, // Deshabilitado en dev para evitar problemas de caché
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks para librerías pesadas
          "vendor-react": ["react", "react-dom"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-supabase": ["@supabase/supabase-js"],
          "vendor-ui": [
            "lucide-react",
            "framer-motion",
            "@radix-ui/react-dialog",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-tabs",
            "@radix-ui/react-collapsible",
            "@radix-ui/react-separator",
            "@radix-ui/react-slot",
          ],
          "vendor-utils": [
            "date-fns",
            "clsx",
            "tailwind-merge",
            "class-variance-authority",
            "zod",
          ],
        },
      },
    },
    // Elevar el límite de advertencia a 600 kB (opcional, ayuda a reducir ruido)
    chunkSizeWarningLimit: 600,
  },
});
