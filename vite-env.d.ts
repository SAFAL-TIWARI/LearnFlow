/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_GOOGLE_CLIENT_SECRET: string;
  readonly VITE_NEXTAUTH_URL: string;
  readonly VITE_NEXTAUTH_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Add process.env to global scope
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      NEXTAUTH_URL: string;
      NEXTAUTH_SECRET: string;
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}