

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

// Apply iframe scroll fix for mobile devices
applyIframeScrollFix()

createRoot(document.getElementById("root")!).render(<App />);