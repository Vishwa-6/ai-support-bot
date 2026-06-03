import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Suppress console in production
if (import.meta.env.PROD) {
  console.log = () => {}
  console.warn = () => {}
  console.error = () => {}
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)