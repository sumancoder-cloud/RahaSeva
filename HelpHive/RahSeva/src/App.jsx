import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LandingPage from "./pages/LandingPage";
import Navbar from './components/Navbar.jsx';
import { useAuth } from "./context/AuthContext";
import AccountLayout from './pages/account/AccountLayout.jsx';
import AccountProfile from './pages/account/AccountProfile.jsx';
import AccountBookings from './pages/account/AccountBookings.jsx';
import AccountPoints from './pages/account/AccountPoints.jsx';
import UserSignUpForm from './pages/UserSignUpForm'; // Renamed import
import LoginForm from "./pages/LoginForm";
import HelperLoginForm from "./pages/HelperLoginForm";
import HelperSignUpForm from './pages/HelperSignUpForm.jsx'; // New import
import UserWelcomePage from "./pages/UserWelcomePage";
import HelperWelcomePage from "./pages/HelperWelcomePage";
import AdminWelcomePage from "./pages/AdminWelcomePage";
import OtpVerifyModel from "./pages/otpVerifyPage";

// PrivateRoute component to protect routes for authenticated users
const PrivateRoute = ({ children }) => {
  const { state } = useAuth();
  if (state.loading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  }
  return state.isAuthenticated ? children : <Navigate to="/login" replace />;
};

// RoleRoute component to protect routes based on user role
const RoleRoute = ({ roles, children }) => {
  const { state } = useAuth();
  if (state.loading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  }
  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (roles && roles.length > 0 && !roles.includes(state.userRole)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
    const { state: { loading, isAuthenticated, userRole } } = useAuth();

    if (loading) {
      return <div className="min-h-screen flex items-center justify-center bg-gray-100"><h1 className="text-3xl font-bold text-gray-800">Loading Application...</h1></div>;
    }

    return (
        <>
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            style={{ zIndex: 99999 }}
          />
          <Navbar />
          <div className="pt-[90px]">
            <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route 
              path="/signup" 
              element={
                isAuthenticated 
                  ? <Navigate to={`/welcome/${userRole === 'admin' ? 'admin' : userRole === 'helper' ? 'helper' : 'user'}`} replace />
                  : <UserSignUpForm />
              } 
            />
            <Route 
              path="/login" 
              element={
                isAuthenticated 
                  ? <Navigate to={`/welcome/${userRole === 'admin' ? 'admin' : userRole === 'helper' ? 'helper' : 'user'}`} replace />
                  : <LoginForm />
              } 
            />
            <Route 
              path="/helper-login" 
              element={
                isAuthenticated 
                  ? <Navigate to={`/welcome/${userRole === 'admin' ? 'admin' : userRole === 'helper' ? 'helper' : 'user'}`} replace />
                  : <HelperLoginForm />
              } 
            />
            <Route 
              path="/helper-signup" 
              element={
                isAuthenticated 
                  ? <Navigate to={`/welcome/${userRole === 'admin' ? 'admin' : userRole === 'helper' ? 'helper' : 'user'}`} replace />
                  : <HelperSignUpForm />
              } 
            />

            {/* Protected Routes - Flattened Structure */}
            <Route path="/welcome/user" element={<PrivateRoute><RoleRoute roles={['user', 'helper', 'admin']}><UserWelcomePage /></RoleRoute></PrivateRoute>} />
            <Route path="/welcome/helper" element={<PrivateRoute><RoleRoute roles={['helper', 'admin']}><HelperWelcomePage /></RoleRoute></PrivateRoute>} />
            <Route path="/welcome/admin" element={<PrivateRoute><RoleRoute roles={['admin']}><AdminWelcomePage /></RoleRoute></PrivateRoute>} />
            
            {/* Account Routes */}
            <Route path="/account" element={<PrivateRoute><AccountLayout /></PrivateRoute>}>
              <Route index element={<AccountProfile />} />
              <Route path="bookings" element={<AccountBookings />} />
              <Route path="points" element={<AccountPoints />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/verifyOtp" element={<OtpVerifyModel isOpen ={true} onClose={()=>{}} onVerify={()=>console.log(otp)}/>} 
              />
            </Routes>

          </div>
        </>
    );
}

export default App;
