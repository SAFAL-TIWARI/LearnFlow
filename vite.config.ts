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
    // Copy PWA-related files to the dist folder
    copyPublicDir: true,
  }
}));
