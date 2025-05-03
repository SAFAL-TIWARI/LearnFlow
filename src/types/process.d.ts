// This file adds TypeScript declarations for the process object

declare global {
  interface Window {
    process: {
      env: {
        NEXTAUTH_URL?: string;
        GOOGLE_CLIENT_ID?: string;
        GOOGLE_CLIENT_SECRET?: string;
        NEXTAUTH_SECRET?: string;
        [key: string]: string | undefined;
      };
    };
  }
}