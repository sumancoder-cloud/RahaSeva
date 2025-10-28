import React, {useState} from 'react';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import GoogleSignInButton from '../components/GoogleButton';

function LoginForm(){
    const { login } = useAuth();
    const navigate = useNavigate();
    const[formData,setFormData]=useState({
        email:'',
        password:'',
    });
    
    const handleChange=(e)=>{
        setFormData({
            ...formData,
            [e.target.name]:e.target.value,

        });
    };
    
    // Google Sign-In handlers
    const handleGoogleSuccess = async (decoded) => {
      const loadingToast = toast.loading("Signing in with Google...", {
        position: "top-right"
      });
      try {
        const response = await axios.post('http://localhost:5000/api/auth/google', {
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture,
          sub: decoded.sub
        });
        
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          toast.update(loadingToast, {
            render: "Google Sign-In Successful! 🎉",
            type: "success",
            isLoading: false,
            autoClose: 2000,
            hideProgressBar: false,
          });
          
          // Redirect based on role
          const role = response.data.user.role;
          setTimeout(() => {
            if (role === 'helper') {
              navigate('/welcome/helper');
            } else if (role === 'admin') {
              navigate('/welcome/admin');
            } else {
              navigate('/welcome/user');
            }
          }, 1000);
        }
      } catch (error) {
        toast.update(loadingToast, {
          render: error.response?.data?.msg || "Google Sign-In failed. Please try again. ❌",
          type: "error",
          isLoading: false,
          autoClose: 3000,
          hideProgressBar: false,
        });
        console.error('Google sign-in error:', error);
      }
    };

    const handleGoogleError = () => {
      toast.error('Google Sign-In failed. Please try again. ❌', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
      });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!formData.email){
            toast.error("Email Is Required ⚠️", {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }
        if(!formData.email.includes('@')){
            toast.error("Enter Email Correctly ⚠️", {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }
        if(formData.password.length < 6){
            toast.error("Password Must Contain length > 6 ⚠️", {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        const loadingToast = toast.loading("Logging In...", {
            position: "top-right"
        });

        try {
            const response = await login(formData.email, formData.password);
            
            if (response.success) {
              toast.update(loadingToast, {
                  render: "Logged in Successfully ✅",
                  type: "success",
                  isLoading: false,
                  autoClose: 2000,
                  hideProgressBar: false,
              });
              console.log("Login successful:", response);
              const { role } = response;
              
              // Redirect based on role with delay
              setTimeout(() => {
                if (role === 'helper') {
                  navigate('/welcome/helper');
                } else if (role === 'admin') {
                  navigate('/welcome/admin');
                } else {
                  navigate('/welcome/user');
                }
              }, 1000);
            } else {
              toast.update(loadingToast, {
                  render: response.msg || "Login failed. Please check your credentials. ❌",
                  type: "error",
                  isLoading: false,
                  autoClose: 3000,
                  hideProgressBar: false,
              });
              console.error("Login failed:", response.msg);
            }
        } catch (error) {
            toast.update(loadingToast, {
                render: "Network error or server unreachable ❌",
                type: "error",
                isLoading: false,
                autoClose: 3000,
                hideProgressBar: false,
            });
            console.error("Login failed:", error);
        }
    };
    return(
       <>
         <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-orange-100">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border-2 border-orange-200">
           <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Login
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
                  Welcome to RahaSeva
                </span>
              </h2>
              <p className="text-gray-600">Sign in to your account</p>
           </div>
         
          <form onSubmit={handleSubmit} className="space-y-6">
             <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900">Email</label>
                <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-xl border-gray-400 shadow-xl focus:border-orange-500 focus:outline-none transition-colors"
                placeholder="Enter your email"
                required
                />
               </div>
               
              
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl shadow-xl focus:border-orange-500 focus:outline-none transition-colors"
                placeholder="Enter your password"
                required
              />
            </div>
            
              <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              Login Account
            </button>
          </form>
          
          {/* Divider */}
          <div className="mt-6 mb-6 flex items-center justify-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm font-semibold text-center">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          
          {/* Google Sign-In Button */}
          <div className="flex justify-center w-full">
            <GoogleSignInButton 
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-orange-500 hover:text-pink-500 font-semibold transition-colors">
                Sign Up
              </Link>
            </p>
          </div>
           </div>
         </div>
       </>
    )
};

export default LoginForm;
