import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext.jsx';

function HelperSignUpForm(){
  const[formData,setFormData]=useState({
           name:'',
           email:'',
           password:'',
           confirmPassword:'',
           role:'helper', // Default role for helpers
           service:'',
           location:'',
           phoneNumber:'',
           experience:'',
           pricePerHour:'',
  });

  const handleChange = (e)=>{
    setFormData({
        ...formData,
        [e.target.name]:e.target.value
    });
  };

  const { register } = useAuth();
  const handleSubmit = async (e)=>{
      e.preventDefault();

      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match!");
        return;
      }

      if (!formData.pricePerHour || Number(formData.pricePerHour) <= 0) {
        toast.error("Please enter a valid price per hour");
        return;
      }

      const loadingToast = toast.loading("Creating Helper Account...");

      try {
        const response = await register(
          formData.name,
          formData.email,
          formData.password,
          formData.phoneNumber,
          formData.role,
          formData.service,
          formData.location,
          Number(formData.experience) || 0,
          Number(formData.pricePerHour)
        );

        if (response.success) {
          toast.update(loadingToast, {
            render: "Helper Account Created Successfully! Please login to continue.",
            type: "success",
            isLoading: false,
            autoClose: 3000
          });
          console.log("Helper account created:", response);
          // Clear the form
          setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: 'helper',
            service: '',
            location: '',
            phoneNumber: '',
            experience: '',
            pricePerHour: ''
          });
          // Redirect to helper login page after successful signup
          setTimeout(() => {
            navigate('/helper-login');
          }, 1500);
        } else {
          toast.update(loadingToast, {
            render: response.msg || "Helper account creation failed",
            type: "error",
            isLoading: false,
            autoClose: 3000
          });
          console.error("Helper account creation failed:", response.msg);
        }
      } catch (error) {
        toast.update(loadingToast, {
          render: "Network error or server unreachable",
          type: "error",
          isLoading: false,
          autoClose: 3000
        });
        console.error("Error submitting helper form:", error);
      }
  };

  const navigate = useNavigate();

  return(
    <div>
       <div className="min-h-screen bg-gradient-to-br from-orange-500 via-white to-green-500 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border-2 border-orange-200">
          <div className=" h-150 text-center justify-center items-center align-center mb-8">
             <h2 className="text-xl text-gray-900 font-semibold ">Join as Helper<span className="block mr-2 text-transparent bg-clip-text bg-gradient-to-r  from-orange-500 to-green-500">Welcome To RahaSeva</span></h2>
             <p className="text-gray-600">Create your helper account to offer help</p>
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">Service You Offer</label>
            <input
              type="text"
              name="service"
              value={formData.service}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
              placeholder="e.g., Plumber, Electrician"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
              placeholder="Your city/area"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
              placeholder="e.g., +1234567890"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Years of Experience</label>
            <input
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
              placeholder="e.g., 5"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Price per Hour (₹)</label>
            <input
              type="number"
              name="pricePerHour"
              value={formData.pricePerHour}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
              placeholder="e.g., 500"
              min="100"
              step="50"
              required
            />
          </div>
         <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
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
            Create Helper Account
          </button>
             </form>
             <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/helper-login" className="text-orange-500 hover:text-pink-500 font-semibold transition-colors">
              Login as Helper
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

  export default HelperSignUpForm;
