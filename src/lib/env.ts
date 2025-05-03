// This file ensures that environment variables are properly loaded

// Google OAuth
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;

// NextAuth
export const NEXTAUTH_URL = import.meta.env.VITE_NEXTAUTH_URL || process.env.NEXTAUTH_URL;
export const NEXTAUTH_SECRET = import.meta.env.VITE_NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET;

// Validate required environment variables
const requiredEnvVars = [
  { name: 'GOOGLE_CLIENT_ID', value: GOOGLE_CLIENT_ID },
  { name: 'GOOGLE_CLIENT_SECRET', value: GOOGLE_CLIENT_SECRET },
  { name: 'NEXTAUTH_URL', value: NEXTAUTH_URL },
  { name: 'NEXTAUTH_SECRET', value: NEXTAUTH_SECRET },
];

// Check for missing environment variables
const missingEnvVars = requiredEnvVars.filter(({ value }) => !value);

// Log warning if any required environment variables are missing
if (missingEnvVars.length > 0) {
  console.warn(
    `Missing required environment variables: ${missingEnvVars.map(({ name }) => name).join(', ')}`
  );
}