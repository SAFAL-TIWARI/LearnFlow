// This file provides a mock implementation of the NextAuth API
// It's used as a fallback when the real NextAuth API fails

export interface MockUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface MockSession {
  user: MockUser;
  expires: string;
}

// Mock user data
const mockUsers: Record<string, MockUser> = {
  'user-1': {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    image: 'https://via.placeholder.com/150',
  },
};

// Check if a user is logged in
export const isLoggedIn = (): boolean => {
  try {
    const authData = localStorage.getItem('mock-auth');
    if (!authData) return false;
    
    const { userId, expires } = JSON.parse(authData);
    if (!userId || !expires) return false;
    
    // Check if the session has expired
    if (new Date(expires) < new Date()) {
      localStorage.removeItem('mock-auth');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking login status:', error);
    return false;
  }
};

// Get the current session
export const getSession = (): MockSession | null => {
  try {
    if (!isLoggedIn()) return null;
    
    const authData = localStorage.getItem('mock-auth');
    if (!authData) return null;
    
    const { userId, expires } = JSON.parse(authData);
    const user = mockUsers[userId];
    
    if (!user) return null;
    
    return {
      user,
      expires,
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

// Sign in a user
export const signIn = (provider: string): Promise<MockSession> => {
  return new Promise((resolve) => {
    // Simulate a delay
    setTimeout(() => {
      const userId = 'user-1';
      const expires = new Date();
      expires.setDate(expires.getDate() + 7); // Expire in 7 days
      
      localStorage.setItem('mock-auth', JSON.stringify({
        userId,
        expires: expires.toISOString(),
      }));
      
      resolve({
        user: mockUsers[userId],
        expires: expires.toISOString(),
      });
    }, 1000);
  });
};

// Sign out a user
export const signOut = (): Promise<void> => {
  return new Promise((resolve) => {
    // Simulate a delay
    setTimeout(() => {
      localStorage.removeItem('mock-auth');
      resolve();
    }, 500);
  });
};