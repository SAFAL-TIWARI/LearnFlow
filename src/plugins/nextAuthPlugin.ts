import { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

// This plugin helps integrate NextAuth with Vite
export function nextAuthPlugin(): Plugin {
  return {
    name: 'vite-plugin-next-auth',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Handle NextAuth API routes
        if (req.url?.startsWith('/api/auth')) {
          try {
            // Get the handler file path
            const handlerPath = path.resolve(__dirname, '../pages/api/auth/[...nextauth].ts');
            
            // Check if the file exists
            if (fs.existsSync(handlerPath)) {
              // Import the handler dynamically
              const handler = (await import(handlerPath)).default;
              
              // Call the handler with the request and response
              await handler(req, res);
            } else {
              console.error(`NextAuth handler not found at ${handlerPath}`);
              next();
            }
          } catch (error) {
            console.error('Error handling NextAuth request:', error);
            next();
          }
        } else {
          next();
        }
      });
    },
  };
}