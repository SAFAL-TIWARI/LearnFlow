// Import environment check first
import './lib/env-check'

// Import polyfills and shims
import './lib/process-env-shim'
import './lib/nextauth-polyfill'

// Import CSS checks
import './utils/tailwind-check'
import './utils/css-vars-check'

// Import iframe scroll fix
import { applyIframeScrollFix } from './utils/iframeScrollFix'

import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles/reset.css'
import './index.css'
import './styles/iframe-touch-fix.css'
import { SupabaseProvider } from './context/SupabaseAuthContext'
import { supabase } from './lib/supabase'

// Expose Supabase client globally for debugging
declare global {
  interface Window {
    supabaseClient: typeof supabase;
    debugSupabase: () => Promise<void>;
  }
}

// Make supabaseClient available in browser console for debugging
window.supabaseClient = supabase;

// Add helpful debugging functions
window.debugSupabase = async () => {
  console.log('🔍 Supabase Debug Info:');
  
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log('📝 Session:', sessionData.session);
    console.log('👤 User from session:', sessionData.session?.user);
    
    const { data: userData, error: userError } = await supabase.auth.getUser();
    console.log('👤 Current user:', userData.user);
    
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    console.log('🗂️ Storage buckets:', buckets);
    
    console.log('🔧 Storage object:', supabase.storage);
    
    if (sessionError) console.error('Session error:', sessionError);
    if (userError) console.error('User error:', userError);
    if (bucketsError) console.error('Buckets error:', bucketsError);
    
  } catch (error) {
    console.error('Debug error:', error);
  }
};

// Log helpful debugging info
console.log('🔧 Debug: supabaseClient is now available globally');
console.log('💡 Try: await supabaseClient.auth.getSession()');
console.log('💡 Try: await supabaseClient.auth.getUser()');
console.log('💡 Try: supabaseClient.storage');
console.log('💡 Try: debugSupabase() - for complete debug info');

// Apply iframe scroll fix for mobile devices
applyIframeScrollFix()

createRoot(document.getElementById("root")!).render(
  <SupabaseProvider>
    <App />
  </SupabaseProvider>
);