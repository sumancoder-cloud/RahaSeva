import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App.jsx' // Uncomment App import
// import UserWelcomePage from './pages/UserWelcomePage.jsx'; // Remove direct import of UserWelcomePage
import { AuthProvider } from './context/AuthContext.jsx'; // Uncomment AuthProvider import
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Re-establishing the correct routing context */}
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
    {/* Original debugging code (commented out):
    <UserWelcomePage />
    */}
  </StrictMode>,
)
