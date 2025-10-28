import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import 'react-toastify/dist/ReactToastify.css'
import App from './App.jsx' // Uncomment App import
// import UserWelcomePage from './pages/UserWelcomePage.jsx'; // Remove direct import of UserWelcomePage
import { AuthProvider } from './context/AuthContext.jsx'; // Uncomment AuthProvider import
import { LanguageProvider } from './context/LanguageContext.jsx';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import {GoogleOAuthProvider} from "@react-oauth/google";
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Re-establishing the correct routing context */}
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
    </GoogleOAuthProvider >
    {/* Original debugging code (commented out):
    <UserWelcomePage />
    */}
  </StrictMode>,
)
