// This is a simple API route to handle Google sign-in on mobile devices
export default function handler(req, res) {
  try {
    // Redirect to the main page with a success parameter
    // This will be handled by the frontend to show a successful login
    res.redirect('/?auth=success&provider=google');
  } catch (error) {
    console.error('Error in Google sign-in handler:', error);
    res.redirect('/?auth=error');
  }
}