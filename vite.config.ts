import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { nextAuthPlugin } from "./src/plugins/nextAuthPlugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Enable history API fallback for SPA routing
    historyApiFallback: true,
  },
  base: "/", // Use absolute paths for assets
  plugins: [
    react(),
    // Enable NextAuth plugin
    nextAuthPlugin(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    copyPublicDir: true,
    outDir: "dist", // Output directory for static hosting
    target: "esnext", // Change from default to support top-level await
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        // Ensure 404.html is included for GitHub Pages
        404: path.resolve(__dirname, 'public/404.html')
      }
    }
  }
}));
