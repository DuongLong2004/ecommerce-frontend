import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

/**
 * Google OAuth Client ID — load từ Vite env.
 *
 * @note Phải có prefix VITE_ thì Vite mới expose biến cho client code.
 *       Cùng Client ID đã setup ở backend (1 OAuth client xài cả 2 đầu).
 *
 * @design Wrap toàn app trong <GoogleOAuthProvider> để các component con
 *         (Login, Register) có thể dùng <GoogleLogin /> hoặc useGoogleLogin().
 */
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)