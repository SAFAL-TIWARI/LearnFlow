// This is a simple API route to handle Google sign-in
import { getEnv } from '../[...nextauth]';

export default function handler(req, res) {
  try {
    // Check if Google credentials are configured
    const clientId = process.env.VITE_GOOGLE_CLIENT_ID || import.meta.env?.VITE_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.VITE_GOOGLE_CLIENT_SECRET || import.meta.env?.VITE_GOOGLE_CLIENT_SECRET;
    
    if (!clientId || !clientSecret || clientId === 'YOUR_GOOGLE_CLIENT_ID' || clientSecret === 'YOUR_GOOGLE_CLIENT_SECRET') {
      console.error('Google OAuth credentials are not properly configured');
      return res.status(500).json({ 
        error: 'Configuration Error',
        message: 'Google OAuth credentials are not properly configured. Please contact the administrator.'
      });
    }
    
    // For direct API access, return a JSON response
    if (req.headers.accept?.includes('application/json')) {
      return res.status(200).json({ 
        message: 'Please use the Google Sign-In button on the main page' 
      });
    }
    
    // Otherwise redirect to the main page
    res.redirect('/?auth=success&provider=google');
  } catch (error) {
    console.error('Error in Google sign-in handler:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}