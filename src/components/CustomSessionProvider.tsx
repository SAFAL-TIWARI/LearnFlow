import React, { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';

interface CustomSessionProviderProps {
  children: ReactNode;
}

// This is a wrapper around SessionProvider that adds error handling
export default function CustomSessionProvider({ children }: CustomSessionProviderProps) {
  // Add error boundary to catch and handle NextAuth errors
  return (
    <AuthErrorBoundary>
      <SessionProvider>{children}</SessionProvider>
    </AuthErrorBoundary>
  );
}

// Simple error boundary component for auth errors
class AuthErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("NextAuth error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="p-4 bg-red-100 text-red-800 rounded-md">
          <h3 className="font-bold">Authentication Error</h3>
          <p>There was a problem with the authentication system. Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}