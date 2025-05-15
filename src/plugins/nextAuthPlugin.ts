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
            // Get the handler file path - use file:// protocol for Windows
            const handlerPath = path.resolve(process.cwd(), 'src/pages/api/auth/[...nextauth].ts');
            const fileUrl = `file://${handlerPath.replace(/\\/g, '/')}`;
            
            // Check if the file exists
            if (fs.existsSync(handlerPath)) {
              // Import the handler dynamically
              const handler = (await import(fileUrl)).default;
              
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