import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(async () => {
  const plugins = [
    react(),
    runtimeErrorOverlay(),
  ];

  // Add cartographer plugin only in development on Replit
  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID) {
    const { cartographer } = await import("@replit/vite-plugin-cartographer");
    plugins.push(cartographer());
  }

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "attached_assets"),
      },
    },
    root: path.resolve(__dirname, "client"),
    build: {
      outDir: path.resolve(__dirname, "dist/public"),
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            // تجميع React في ملف منفصل - يتم تحميله أولاً
            if (id.includes('node_modules/react') || 
                id.includes('node_modules/react-dom') || 
                id.includes('node_modules/scheduler')) {
              return 'react-core';
            }
            
            // تجميع مكتبات التوجيه (Routing)
            if (id.includes('node_modules/react-router') || 
                id.includes('node_modules/wouter') ||
                id.includes('node_modules/history')) {
              return 'router-vendor';
            }
            
            // تجميع مكتبات إدارة الحالة (State Management)
            if (id.includes('@tanstack') || 
                id.includes('react-query') ||
                id.includes('zustand') ||
                id.includes('redux')) {
              return 'state-vendor';
            }
            
            // تجميع مكتبات الأيقونات
            if (id.includes('lucide-react') || 
                id.includes('@radix-ui/react-icons')) {
              return 'icons-vendor';
            }
            
            // تجميع مكتبات واجهة المستخدم (UI)
            if (id.includes('@radix-ui') && !id.includes('react-icons')) {
              return 'ui-vendor';
            }
            
            // تجميع مكتبات الخرائط
            if (id.includes('leaflet') || 
                id.includes('@googlemaps') || 
                id.includes('@react-google-maps') ||
                id.includes('mapbox')) {
              return 'maps-vendor';
            }
            
            // تجميع مكتبات قاعدة البيانات (تبقى على السيرفر فقط)
            if (id.includes('drizzle-orm') || 
                id.includes('postgres') ||
                id.includes('pg')) {
              return 'db-vendor';
            }
            
            // جميع المكتبات الأخرى
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          }
        },
      },
      chunkSizeWarningLimit: 1500,
    },
    server: {
      host: "0.0.0.0",
      port: 5000,
      strictPort: false,
      allowedHosts: true,
      hmr: {
        clientPort: 443,
      },
      fs: {
        strict: false,
      },
    },
  };
});
