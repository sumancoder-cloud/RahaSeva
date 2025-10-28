import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const HelperLoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loadingToast = toast.loading("Logging In as Helper...");

    try {
      const response = await login(email, password);

      if (response.success) {
        toast.update(loadingToast, {
          render: "Helper Login Successful",
          type: "success",
          isLoading: false,
          autoClose: 3000
        });
        console.log('Helper Login successful:', response);
        const { role } = response;

        if (role === 'helper') {
          navigate('/welcome/helper');
        } else {
          toast.update(loadingToast, {
            render: 'You are not authorized to log in as a helper.',
            type: "error",
            isLoading: false,
            autoClose: 3000
          });
          navigate('/login');
        }

      } else {
        toast.update(loadingToast, {
          render: response.msg || 'Helper login failed. Please check your credentials.',
          type: "error",
          isLoading: false,
          autoClose: 3000
        });
        console.error('Helper Login failed:', response.msg);
      }
    } catch (error) {
      toast.update(loadingToast, {
        render: "Network error or server unreachable",
        type: "error",
        isLoading: false,
        autoClose: 3000
      });
      console.error('Error during helper login:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-orange-100">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border-2 border-orange-200">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Helper Login<span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">Welcome to RahaSeva</span></h2>
          <p className="text-gray-600">Sign in to your helper account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-3 border-2 rounded-xl border-gray-400 shadow-xl focus:border-orange-500 focus:outline-none transition-colors"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              autoComplete="current-password"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            Login as Helper
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have a helper account?{' '}
            <Link to="/helper-signup" className="text-orange-500 hover:text-pink-500 font-semibold transition-colors">
              Sign Up as Helper
            </Link>
          </p>
        </div>
      </div>
      <ToastContainer position="top-right" />
    </div>
  );
};

export default HelperLoginForm;
