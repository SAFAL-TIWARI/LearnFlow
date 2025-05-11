import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getRedirectUri, getGoogleCallbackUrl } from "../../../lib/redirect-uri-helper";

// Get environment variables from window.process.env (for client-side)
// or from import.meta.env (for server-side)
export const getEnv = (key: string): string => {
  if (typeof window !== 'undefined' && window.process?.env) {
    return window.process.env[key] || '';
  }
  
  // For Vercel deployment
  if (process.env[`VITE_${key}`]) {
    return process.env[`VITE_${key}`] as string;
  }
  
  // For local development with Vite
  return (import.meta.env[`VITE_${key}`] as string) || '';
};

const GOOGLE_CLIENT_ID = getEnv('GOOGLE_CLIENT_ID') || 'GOOGLE_CLIENT_ID';
const GOOGLE_CLIENT_SECRET = getEnv('GOOGLE_CLIENT_SECRET') || 'GOOGLE_CLIENT_SECRET';
const NEXTAUTH_SECRET = getEnv('NEXTAUTH_SECRET');
const NEXTAUTH_URL = getRedirectUri();

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID || "missing-client-id",
      clientSecret: GOOGLE_CLIENT_SECRET || "missing-client-secret",
      authorization: {
        params: {
          prompt: "select_account", // Force Google to show the account selection screen
          access_type: "offline", // Get a refresh token
          response_type: "code"
        }
      },
      // Explicitly set the callback URL to match what's in Google Cloud Console
      callbackUrl: getGoogleCallbackUrl()
    }),
  ],
  secret: NEXTAUTH_SECRET || "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",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Explicitly set the URL to ensure redirect URIs match what's in Google Cloud Console
  url: NEXTAUTH_URL,
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
    async signIn({ account, profile }) {
      if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        console.error("Google OAuth credentials are missing!");
        return false;
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Use our explicitly defined site URL
      const siteUrl = NEXTAUTH_URL;
      
      // Ensure we redirect back to the original site after authentication
      if (url.startsWith(siteUrl)) return url;
      if (url.startsWith("/")) return new URL(url, siteUrl).toString();
      
      // If all else fails, redirect to the site root
      return siteUrl;
    }
  },
  pages: {
    signIn: "/",
    error: "/auth-error",
  },
  debug: process.env.NODE_ENV !== "production",
  logger: {
    error(code, metadata) {
      console.error(`Auth error: ${code}`, metadata);
    },
    warn(code) {
      console.warn(`Auth warning: ${code}`);
    },
    debug(code, metadata) {
      console.log(`Auth debug: ${code}`, metadata);
    },
  },
});