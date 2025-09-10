import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext.jsx';
function UserSignUpForm(){
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

  const { register } = useAuth(); // Destructure register from useAuth
  const handleSubmit = async (e)=>{
      e.preventDefault(); // This prevents the page from reloading on form submission

      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match!");
        return;
      }

      const loadingToast = toast.loading("Creating Your Account...");

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
            render: "Account Created Successfully! Please login to continue.",
            type: "success",
            isLoading: false,
            autoClose: 3000
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
          }, 1500);
        } else {
          toast.update(loadingToast, {
            render: response.msg || "Account creation failed",
            type: "error",
            isLoading: false,
            autoClose: 3000
          });
          console.error("Account creation failed:", response.msg);
        }
      } catch (error) {
        toast.update(loadingToast, {
          render: "Network error or server unreachable",
          type: "error",
          isLoading: false,
          autoClose: 3000
        });
        console.error("Error submitting form:", error);
      }
  };

  const navigate = useNavigate();

      return(
        <div>
           <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-orange-100 flex items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border-2 border-orange-200">
              <div className="text-center mb-8">
                 <h2 className="text-3xl font-bold text-gray-900 mb-2">Join<span className="block mr-2 text-transparent bg-clip-text bg-gradient-to-r  from-orange-500 to-pink-500">Welcome To RahaSeva</span></h2>
                 <p className="text-gray-600">Create your account to start helping or getting help</p>
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
          <ToastContainer position="top-right" />

        </div>
      )
  };

  export default UserSignUpForm;
