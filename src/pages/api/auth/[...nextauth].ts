import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Get environment variables from window.process.env (for client-side)
// or from import.meta.env (for server-side)
const getEnv = (key: string): string => {
  if (typeof window !== 'undefined' && window.process?.env) {
    return window.process.env[key] || '';
  }
  return (import.meta.env[`VITE_${key}`] as string) || '';
};

const GOOGLE_CLIENT_ID = getEnv('GOOGLE_CLIENT_ID');
const GOOGLE_CLIENT_SECRET = getEnv('GOOGLE_CLIENT_SECRET');
const NEXTAUTH_SECRET = getEnv('NEXTAUTH_SECRET');

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: NEXTAUTH_SECRET || "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",
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  debug: import.meta.env.DEV,
});