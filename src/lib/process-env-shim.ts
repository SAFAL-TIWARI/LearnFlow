// This file creates a shim for process.env to work with Vite
// It's needed because NextAuth expects process.env to be available

// Define the window.process interface
declare global {
  interface Window {
    process?: {
      env: {
        NEXTAUTH_URL?: string;
        GOOGLE_CLIENT_ID?: string;
        GOOGLE_CLIENT_SECRET?: string;
        NEXTAUTH_SECRET?: string;
        NODE_ENV?: string;
        [key: string]: string | undefined;
      };
      browser?: boolean;
    };
  }
}

// Create the process object if it doesn't exist
if (typeof window !== 'undefined') {
  if (!window.process) {
    window.process = {
      env: {}
    };
  }
  
  // Ensure process.env exists
  if (!window.process.env) {
    window.process.env = {};
  }
  
  // Add environment variables
  window.process.env.NEXTAUTH_URL = import.meta.env.VITE_NEXTAUTH_URL as string;
  window.process.env.GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
  window.process.env.GOOGLE_CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET as string;
  window.process.env.NEXTAUTH_SECRET = import.meta.env.VITE_NEXTAUTH_SECRET as string;
  window.process.env.NODE_ENV = import.meta.env.MODE === 'production' ? 'production' : 'development';
}

export {};