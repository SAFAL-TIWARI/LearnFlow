// This file provides polyfills for NextAuth to work with Vite

// Polyfill for fetch
if (typeof window !== 'undefined') {
  // Ensure fetch is available
  if (!window.fetch) {
    console.warn('Fetch API not available, polyfilling...');
    // This is just a placeholder - in a real app you'd include a fetch polyfill
  }

  // Add missing properties to window.crypto if needed
  if (!window.crypto || !window.crypto.subtle) {
    console.warn('Web Crypto API not fully available, polyfilling...');
    // This is just a placeholder - in a real app you'd include a crypto polyfill
  }
}

// Polyfill for process.browser
if (typeof window !== 'undefined') {
  if (!window.process) {
    window.process = { env: {} };
  }
  window.process.browser = true;
}

// Polyfill for Buffer
if (typeof window !== 'undefined' && typeof window.Buffer === 'undefined') {
  try {
    // @ts-ignore
    window.Buffer = { isBuffer: () => false };
  } catch (e) {
    console.warn('Failed to polyfill Buffer', e);
  }
}

export {};