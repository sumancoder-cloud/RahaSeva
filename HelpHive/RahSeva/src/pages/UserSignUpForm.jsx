import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import GoogleSignInButton from '../components/GoogleButton';

function UserSignUpForm(){
  const navigate = useNavigate();
  const[formData,setFormData]=useState({
           name:'',
           email:'',
           password:'',
           confirmPassword:'',
           role:'user' // Default role

  });

  const handleChange = (e)=>{
    setFormData({
        ...formData,
        [e.target.name]:e.target.value
    });
  };

  const { register } = useAuth();
  
  // Google Sign-In handlers
  const handleGoogleSuccess = async (decoded) => {
    const loadingToast = toast.loading("Signing up with Google...", {
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
          render: "Google Sign-Up Successful! 🎉",
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
        render: error.response?.data?.message || "Google Sign-Up failed. Please try again. ❌",
        type: "error",
        isLoading: false,
        autoClose: 3000,
        hideProgressBar: false,
      });
      console.error('Google sign-up error:', error);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google Sign-Up failed. Please try again. ❌', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
    });
  };
  
  const handleSubmit = async (e)=>{
      e.preventDefault(); // This prevents the page from reloading on form submission

      if (!formData.name || formData.name.trim().length < 2) {
        toast.error("Name must be at least 2 characters long ⚠️", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      if (!formData.email || !formData.email.includes('@')) {
        toast.error("Please enter a valid email address ⚠️", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters long ⚠️", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match! ⚠️", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      const loadingToast = toast.loading("Creating Your Account...", {
        position: "top-right"
      });

      try {
        const response = await register(
          formData.name,
          formData.email, 
          formData.password, 
          '', // phone (optional for users)
          formData.role,
          '', // service (only for helpers)
          '', // location (optional for users)
          0, // experience (only for helpers)
          0 // pricePerHour (only for helpers)
        );

        if (response.success) {
          toast.update(loadingToast, {
            render: "Account Created Successfully! 🎉 Please login to continue.",
            type: "success",
            isLoading: false,
            autoClose: 3000,
            hideProgressBar: false,
          });
          console.log("Account created:", response);
          // Clear the form
          setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: 'user'
          });
          // Redirect to login page after successful signup
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          toast.update(loadingToast, {
            render: response.msg || "Account creation failed ❌",
            type: "error",
            isLoading: false,
            autoClose: 3000,
            hideProgressBar: false,
          });
          console.error("Account creation failed:", response.msg);
        }
      } catch (error) {
        toast.update(loadingToast, {
          render: "Network error or server unreachable ❌",
          type: "error",
          isLoading: false,
          autoClose: 3000,
          hideProgressBar: false,
        });
        console.error("Error submitting form:", error);
      }
  };

  return(
        <>
        <div>
           <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-orange-100 flex items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border-2 border-orange-200">
              <div className="text-center mb-8">
                 <h2 className="text-3xl font-bold text-gray-900 mb-2">Join<span className="block mr-2 text-transparent bg-clip-text bg-gradient-to-r  from-orange-500 to-pink-500">Welcome To RahaSeva</span></h2>
                 <p className="text-gray-600">Create your account to start helping or getting help</p>
              </div>
              
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
             <label className="block text-sm font-semibold text-gray-900 mb-2">FullName</label>            
             <input 
             
             type="text"
             name="name"
             value={formData.name}
             onChange={handleChange}
             className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl shadow-xl focus:border-orange-500 focus:outline-none transition-colors"
             required
             />

             </div>
             <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">Email</label>
              <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 rounded-xl border-gray-400 shadow-xl focus:border-orange-500  focus:outline-none transition-colors"
              required
              />
             </div>
             <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">I want to</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
            >
              <option value="user">Find Help</option>
              <option value="helper">Offer Help</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
              placeholder="Create a password"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
              placeholder="Confirm your password"
              required
            />

          </div>
           <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            Create Account
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
            Already have an account?{' '}
            <Link to="/login" className="text-orange-500 hover:text-pink-500 font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>   
     </div>
    </div>
   </>
  )
};

export default UserSignUpForm;
