import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
// import { ClerkProvider } from '@clerk/clerk-react'

// Note: Clerk authentication disabled for Week 3-4 demo
// Will be enabled in post-production when authentication is needed
// const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || ''

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
