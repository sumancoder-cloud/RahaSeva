import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { state: { isAuthenticated }, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-2 border-black w-full bg-gradient-to-r from-orange-500 to-pink-500 fixed top-0 z-50">
        {/* Main Navbar */}
        <div className="flex justify-between items-center h-[70px] p-2">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img 
              src="/assets/RahaSeva.png" 
              alt="RahaSeva Logo" 
              className="w-40 h-12 object-contain rounded-xl shadow-lg border-2 border-white/30 bg-white/10 backdrop-blur-sm"
            />
            <span className="font-bold text-2xl text-white tracking-wide drop-shadow-lg">RahaSeva</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center">
            <ul className="flex gap-6 text-white font-semibold items-center cursor-pointer">
              <li>
                <a href="#home" className="hover:text-orange-200 transition-colors">Home</a>
              </li>
              <li>
                <a href="#about" className="hover:text-orange-200 transition-colors">About Us</a>
              </li>
              <li>
                <select name="services" id="services" className="bg-transparent text-white border-none outline-none cursor-pointer hover:text-orange-200">
                  <option className="text-black">Services</option>
                  <option className="text-black">Plumber</option>
                  <option className="text-black">Tutor</option>
                  <option className="text-black">Carpenter</option>
                  <option className="text-black">Mechanic</option>
                  <option className="text-black">Electrician</option>
                </select>
              </li>
              <li>
                <a href="#contact" className="hover:text-orange-200 transition-colors">Contact Us</a>
              </li>
            </ul>
          </div>

          {/* Desktop Buttons */}
          <div className="nav-buttons hidden lg:flex gap-6 text-white font-semibold">
            {isAuthenticated ? (
              <button 
                onClick={handleLogout}
                className="p-3 border-2 border-white rounded-full hover:text-red-500 cursor-pointer transition-all duration-300"
              >
                Logout
              </button>
            ) : (
              <>
                <Link to="/signup">
                <button className="p-3 border-2 text-white border-white rounded-full hover:text-red-500 cursor-pointer  transition-all duration-300">
                  Sign Up 
                </button>
                </Link>
                <Link to="/login">
                <button className="p-3 border-2 border-white rounded-full cursor-pointer hover:text-pink-500 transition-all duration-300">
                  Login
                </button>
                </Link>
              </>
            )}
          </div>


          {/* Mobile menu button */}
          <button 
            className="lg:hidden text-white cursor-pointer text-xl" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <i className={`fa-solid ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>

        {/* Mobile Menu - Vertical Dropdown */}
        {isMenuOpen && (
          <div className="lg:hidden bg-gradient-to-r from-orange-500 to-pink-500 border-t-2 border-white">
            <div className="flex flex-col p-4 space-y-4">
              {/* Mobile Navigation Links */}
              <div className="flex flex-col space-y-3">
                <a 
                  href="#home" 
                  className="text-white font-semibold py-2 px-4 rounded-lg hover:bg-white hover:text-orange-500 transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </a>
                <a 
                  href="#about" 
                  className="text-white font-semibold py-2 px-4 rounded-lg hover:bg-white hover:text-orange-500 transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About Us
                </a>
                
                {/* Mobile Services Dropdown */}
                <div className="text-white font-semibold">
                  <select 
                    name="services" 
                    className="w-full bg-white text-orange-500 py-2 px-4 rounded-lg border-none outline-none cursor-pointer font-semibold"
                  >
                    <option>Services</option>
                    <option>Plumber</option>
                    <option>Tutor</option>
                    <option className="text-black">Carpenter</option>
                    <option className="text-black">Mechanic</option>
                    <option className="text-black">Electrician</option>
                  </select>
                </div>
                
                <a 
                  href="#contact" 
                  className="text-white font-semibold py-2 px-4 rounded-lg hover:bg-white hover:text-orange-500 transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact Us
                </a>
              </div>

              {/* Mobile Buttons */}
              <div className="flex flex-col space-y-3 pt-4 border-t border-white border-opacity-30">
                {isAuthenticated ? (
                  <button 
                    onClick={handleLogout}
                    className="w-full py-3 border-2 border-white text-white rounded-full font-bold hover:bg-white hover:text-red-500 transition-all duration-300"
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    <Link to="/signup">
                    <button className="w-full py-3 border-2 border-white text-white rounded-full font-bold hover:bg-white hover:text-orange-500 transition-all duration-300">
                      Sign Up
                    </button>
                    </Link>
                    <Link to="/login">
                    <button className="w-full py-3 border-2 border-white text-white rounded-full font-bold hover:bg-white hover:text-pink-500 transition-all duration-300">
                      Login
                    </button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-[90px] min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-orange-100 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                Welcome to{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
                  RahaSeva
                </span>
              </h1>
              <p className="text-xl text-gray-700 max-w-2xl mb-8">
                Connecting hearts, building communities. Find trusted services, volunteers, 
                and opportunities all in one place. Together, we make helping easier.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <Link to="/signup">
                <button className="px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 font-semibold text-lg">
                  Join Now
                </button>
                </Link>
                <button className="px-8 py-4 border-2 border-orange-500 text-orange-500 rounded-xl hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500 hover:text-white transition-all duration-300 font-semibold text-lg">
                  Watch Demo
                </button>
              </div>
              <div className="flex items-center justify-center lg:justify-start space-x-8">
                <div className="text-center bg-white p-4 rounded-xl shadow-md">
                  <div className="text-3xl font-bold text-orange-500">10K+</div>
                  <div className="text-gray-600">Happy Users</div>
                </div>
                <div className="text-center bg-white p-4 rounded-xl shadow-md">
                  <div className="text-3xl font-bold text-pink-500">500+</div>
                  <div className="text-gray-600">Services</div>
                </div>
                <div className="text-center bg-white p-4 rounded-xl shadow-md">
                  <div className="text-3xl font-bold text-orange-500">24/7</div>
                  <div className="text-gray-600">Support</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 border-2 border-orange-200">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                      <i className="fas fa-heart text-white text-xl"></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Find Help</h3>
                      <p className="text-gray-600">Connect with helpers nearby</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center">
                      <i className="fas fa-hands-helping text-white text-xl"></i>                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Offer Help</h3>
                      <p className="text-gray-600">Share your skills and time</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                      <i className="fas fa-shield-alt text-white text-xl"></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Build Trust</h3>
                      <p className="text-gray-600">Verified profiles and reviews</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">Services</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We connect you with verified professionals for all your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl border-2 border-orange-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                <i className="fas fa-wrench text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Plumber</h3>
              <p className="text-gray-600">
                Professional plumbing services for all your water and pipe related needs.
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-8 rounded-2xl border-2 border-pink-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                <i className="fas fa-graduation-cap text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Tutor</h3>
              <p className="text-gray-600">
                Expert tutors for all subjects and levels to help you achieve your goals.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl border-2 border-orange-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                <i className="fas fa-hammer text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Carpenter</h3>
              <p className="text-gray-600">
                Skilled carpenters for furniture, repairs, and custom woodwork projects.
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-8 rounded-2xl border-2 border-pink-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                <i className="fas fa-cog text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Mechanic</h3>
              <p className="text-gray-600">
                Reliable mechanics for vehicle maintenance and repair services.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl border-2 border-orange-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                <i className="fas fa-bolt text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Electrician</h3>
              <p className="text-gray-600">
                Licensed electricians for safe and professional electrical work.
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-8 rounded-2xl border-2 border-pink-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                <i className="fas fa-plus text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">More Services</h3>
              <p className="text-gray-600">
                Many more services available. Join us to explore all possibilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 via-pink-50 to-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">Works</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Getting help or offering assistance has never been easier
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center bg-white p-8 rounded-2xl shadow-lg border-2 border-orange-200">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Sign Up</h3>
              <p className="text-gray-600">
                Create your profile in minutes. Tell us about yourself and your needs.
              </p>
            </div>

            <div className="text-center bg-white p-8 rounded-2xl shadow-lg border-2 border-pink-200">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Connect</h3>
              <p className="text-gray-600">
                Browse available helpers or post your request. Get matched instantly.
              </p>
            </div>

            <div className="text-center bg-white p-8 rounded-2xl shadow-lg border-2 border-orange-200">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Get Help</h3>
              <p className="text-gray-600">
                Complete the task and leave reviews to build our trusted community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">RahaSeva?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide the best platform for community connections
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border-2 border-orange-200">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-search text-white text-xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Matching</h3>
              <p className="text-gray-600 text-sm">AI-powered system for perfect connections</p>
            </div>

            <div className="text-center bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border-2 border-pink-200">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-shield-check text-black text-xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Verified Profiles</h3>
              <p className="text-gray-600 text-sm">All helpers are verified for safety</p>
            </div>

            <div className="text-center bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border-2 border-orange-200">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-clock text-white text-xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-600 text-sm">Round the clock customer support</p>
            </div>

            <div className="text-center bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-2xl border-2 border-pink-200">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-dollar-sign text-white text-xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fair Pricing</h3>
              <p className="text-gray-600 text-sm">Transparent pricing with no hidden fees</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="about" className="py-20 bg-gradient-to-br from-orange-50 via-pink-50 to-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">Community</span> Says
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real stories from our satisfied users
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-orange-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                  S
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900">Sarah Johnson</h4>
                  <p className="text-gray-600 text-sm">New Mom</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "RahaSeva was a lifesaver when I needed help with groceries after my baby was born. 
                The helper was so kind and reliable!"
              </p>
              <div className="flex text-yellow-400">
                ★★★★★
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-pink-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900">Mike Chen</h4>
                  <p className="text-gray-600 text-sm">College Student</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "I love helping others through RahaSeva! It's so easy to find people who need 
                assistance, and I've made great friends."
              </p>
              <div className="flex text-yellow-400">
                ★★★★★
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-orange-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                  E
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900">Emily Rodriguez</h4>
                  <p className="text-gray-600 text-sm">Senior Citizen</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "The verification process made me feel safe. RahaSeva has truly improved my quality of life."
              </p>
              <div className="flex text-yellow-400">
                ★★★★★
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-pink-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Join Our Community?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Whether you need help or want to help others, RahaSeva is here to connect you 
            with your community. Start making a difference today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/helper-signup">
            <button className="px-8 py-4 bg-white text-orange-500 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 font-semibold text-lg">
              Join as Helper
            </button>
            </Link>
            <button className="px-8 py-4 border-2 border-white text-white rounded-xl hover:bg-white hover:text-pink-500 transition-all duration-300 font-semibold text-lg">
              Find Help Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img 
                  src="/assets/RahaSeva.png" 
                  alt="RahaSeva Logo" 
                  className="w-12 rounded-full"
                />
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400">RahaSeva</h3>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                Building stronger communities by connecting people who want to help 
                with those who need assistance. Together, we make the world a better place.
              </p>
              <div className="flex space-x-4">
                
                <a href="https://www.linkedin.com/in/tati-suman-yadav-938569351/" className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                  <i className="fab fa-linkedin text-white"></i>
                </a>
                <a href="https://www.instagram.com/sumanyadav_tati/" className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                  <i className="fab fa-instagram text-white"></i>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-orange-400">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#home" className="text-gray-300 hover:text-pink-400 transition-colors">Home</a></li>
                <li><a href="#services" className="text-gray-300 hover:text-pink-400 transition-colors">Services</a></li>
                <li><a href="#about" className="text-gray-300 hover:text-pink-400 transition-colors">About Us</a></li>
                <li><a href="#contact" className="text-gray-300 hover:text-pink-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-pink-400">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">Safety</a></li>
                <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 RahaSeva. All rights reserved. Made with ❤️ for our community.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;