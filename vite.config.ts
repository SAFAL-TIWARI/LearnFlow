import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { nextAuthPlugin } from "./src/plugins/nextAuthPlugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Determine base path for GitHub Pages
  const isGitHubPages = process.env.GITHUB_PAGES === 'true' || process.env.GITHUB_ACTIONS === 'true';
  const basePath = isGitHubPages ? '/LearnFlow/' : '/';

  return {
    server: {
      host: "::",
      port: 8080,
      // Enable history API fallback for SPA routing
      historyApiFallback: true,
    },
    base: basePath, // Dynamic base path for different hosting platforms
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
      target: "es2015", // Changed from esnext for better compatibility
      assetsDir: "assets", // Organize assets in subdirectory
      sourcemap: false, // Disable sourcemaps for production
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
        output: {
          // Ensure proper file extensions for modules
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
          // Ensure proper MIME types
          format: 'es',
        }
      }
    },
    // Ensure proper MIME type handling
    optimizeDeps: {
      include: ['react', 'react-dom']
    }
  };
});
