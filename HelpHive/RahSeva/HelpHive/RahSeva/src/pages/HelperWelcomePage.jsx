import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const HelperWelcomePage = () => {
  const { logout, state } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [helperData, setHelperData] = useState({
    name: 'Helper',
    email: '',
    phone: '',
    service: '',
    location: '',
    rating: 4.8,
    totalJobs: 234,
    todayBookings: 5,
    weeklyEarnings: 12450,
    isOnline: true
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // API Base URL
  const API_BASE_URL = 'http://localhost:5000/api';

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // API call helper
  const apiCall = async (endpoint, options = {}) => {
    const token = getAuthToken();
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'API call failed');
      }
      
      return data;
    } catch (error) {
      console.error(`API call to ${endpoint} failed:`, error);
      throw error;
    }
  };

  // Load helper data
  useEffect(() => {
    const loadHelperData = async () => {
      try {
        if (state.isAuthenticated && state.user) {
          if (state.user.profile) {
            setHelperData({
              name: state.user.name || 'Helper',
              email: state.user.email || '',
              phone: state.user.profile.phone || '',
              service: state.user.service || 'Service Provider',
              location: state.user.profile.location || 'Hyderabad, Telangana',
              rating: 4.8,
              totalJobs: 234,
              todayBookings: 5,
              weeklyEarnings: 12450,
              isOnline: true
            });
          } else {
            // Fetch profile from API
            const profileData = await apiCall('/auth/profile');
            if (profileData.success !== false) {
              setHelperData({
                name: profileData.user.name || 'Helper',
                email: profileData.user.email || '',
                phone: profileData.user.phone || '',
                service: profileData.user.service || 'Service Provider',
                location: profileData.user.location || 'Hyderabad, Telangana',
                rating: 4.8,
                totalJobs: 234,
                todayBookings: 5,
                weeklyEarnings: 12450,
                isOnline: true
              });
            }
          }
        }
      } catch (error) {
        console.error('Error loading helper data:', error);
      }
    };

    const loadRecentBookings = async () => {
      try {
        if (state.isAuthenticated) {
          // For now, use mock data for helper bookings
          // In a real app, this would be a separate endpoint for helper bookings
          setRecentBookings([
            {
              id: 1,
              customer: 'Mr. Sharma',
              service: 'Pipe repair',
              status: 'completed',
              time: '2 hours ago',
              amount: '₹450'
            },
            {
              id: 2,
              customer: 'Ms. Priya',
              service: 'Electrical work',
              status: 'confirmed',
              time: '5 hours ago',
              amount: '₹600'
            },
            {
              id: 3,
              customer: 'John',
              service: 'AC Repair',
              status: 'rated',
              time: '1 day ago',
              amount: '₹800'
            }
          ]);
        }
      } catch (error) {
        console.error('Error loading bookings:', error);
      }
    };

    loadHelperData();
    loadRecentBookings();
  }, [state.isAuthenticated, state.user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleOnlineStatus = () => {
    setHelperData(prev => ({
      ...prev,
      isOnline: !prev.isOnline
    }));
    
    toast.success(
      helperData.isOnline ? 'You are now offline' : 'You are now online and available for bookings!',
      {
        position: "top-right",
        autoClose: 2000,
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex flex-col">
      {/* Main Content - Navbar is global now */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8">
        {activeSection === 'dashboard' && (
          <>
            {/* Welcome Section */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
                Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">{helperData.name}!</span>
              </h2>
              <p className="text-xl text-gray-700 mb-6">
                Manage services, accept/reject requests, do video consults, and track earnings.
              </p>
              
              {/* Status Toggle */}
              <div className="inline-flex items-center bg-white rounded-xl p-2 shadow-lg border-2 border-emerald-200">
                <span className="text-gray-700 mr-3">Status:</span>
                <button 
                  onClick={toggleOnlineStatus}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    helperData.isOnline 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                      : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                  }`}
                >
                  {helperData.isOnline ? '🟢 Online & Available' : '🔴 Offline'}
                </button>
              </div>
            </div>

            {/* Provider features aligned with proposal */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              
              {/* Today's Bookings */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-emerald-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Today's Bookings</h3>
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <i className="fas fa-calendar-day text-white"></i>
                  </div>
                </div>
                <div className="text-3xl font-bold text-emerald-600 mb-2">{helperData.todayBookings}</div>
                <p className="text-gray-600 text-sm">2 pending, 3 confirmed</p>
              </div>

              {/* Earnings This Week */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-teal-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Weekly Earnings</h3>
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
                    <i className="fas fa-rupee-sign text-white"></i>
                  </div>
                </div>
                <div className="text-3xl font-bold text-teal-600 mb-2">₹{helperData.weeklyEarnings.toLocaleString()}</div>
                <p className="text-gray-600 text-sm">+15% from last week</p>
              </div>

              {/* Rating */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-yellow-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Your Rating</h3>
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                    <i className="fas fa-star text-white"></i>
                  </div>
                </div>
                <div className="text-3xl font-bold text-yellow-600 mb-2">{helperData.rating}/5</div>
                <p className="text-gray-600 text-sm">Based on 127 reviews</p>
              </div>

              {/* Total Jobs */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Jobs Completed</h3>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <i className="fas fa-check-circle text-white"></i>
                  </div>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">{helperData.totalJobs}</div>
                <p className="text-gray-600 text-sm">Since joining</p>
              </div>
            </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          
          {/* Manage Services */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-emerald-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 mx-auto">
              <i className="fas fa-cogs text-white text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Manage Services</h3>
            <p className="text-gray-600 text-sm text-center mb-4">Update your services, prices, and availability</p>
            <button className="w-full py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all">Manage</button>
          </div>

          {/* Booking Requests */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-teal-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center mb-4 mx-auto">
              <i className="fas fa-calendar-alt text-white text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">View Bookings</h3>
            <p className="text-gray-600 text-sm text-center mb-4">Check upcoming appointments and requests</p>
            <button className="w-full py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all">View All</button>
          </div>

          {/* Video Consultation */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-purple-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto">
              <i className="fas fa-video text-white text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Video Consultation</h3>
            <p className="text-gray-600 text-sm text-center mb-4">Provide remote guidance with AR support</p>
            <button className="w-full py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all">Start Call</button>
          </div>
        </div>

        {/* Helper Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          {/* Profile Verification */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-200">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-3 mx-auto">
              <i className="fas fa-shield-check text-white text-lg"></i>
            </div>
            <h4 className="font-bold text-gray-900 text-center mb-2">Verified Badge</h4>
            <p className="text-gray-600 text-sm text-center">KYC verified trusted professional</p>
          </div>

          {/* Instant Earnings */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-3 mx-auto">
              <i className="fas fa-money-bill-wave text-white text-lg"></i>
            </div>
            <h4 className="font-bold text-gray-900 text-center mb-2">Instant Payments</h4>
            <p className="text-gray-600 text-sm text-center">Get paid immediately after job completion</p>
          </div>

          {/* Live Tracking */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl border-2 border-indigo-200">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mb-3 mx-auto">
              <i className="fas fa-map-marked-alt text-white text-lg"></i>
            </div>
            <h4 className="font-bold text-gray-900 text-center mb-2">Live Tracking</h4>
            <p className="text-gray-600 text-sm text-center">Share real-time arrival with customers</p>
          </div>

          {/* Support 24/7 */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border-2 border-orange-200">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-3 mx-auto">
              <i className="fas fa-headset text-white text-lg"></i>
            </div>
            <h4 className="font-bold text-gray-900 text-center mb-2">24/7 Support</h4>
            <p className="text-gray-600 text-sm text-center">Round the clock helper support</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h3>
          <div className="space-y-4">
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <i className="fas fa-check text-white"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Plumbing job completed</h4>
                  <p className="text-gray-600 text-sm">Mr. Sharma - Pipe repair</p>
                </div>
              </div>
              <span className="text-gray-500 text-sm">2 hours ago</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <i className="fas fa-calendar text-white"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">New booking received</h4>
                  <p className="text-gray-600 text-sm">Ms. Priya - Electrical work</p>
                </div>
              </div>
              <span className="text-gray-500 text-sm">5 hours ago</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                  <i className="fas fa-star text-white"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">5-star rating received</h4>
                  <p className="text-gray-600 text-sm">Great service! - John</p>
                </div>
              </div>
              <span className="text-gray-500 text-sm">1 day ago</span>
            </div>
          </div>
        </div>
          </>
        )}

        {activeSection === 'bookings' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-900">My Bookings</h2>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg">Today</button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">This Week</button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">All</button>
              </div>
            </div>

            {/* Bookings List */}
            <div className="grid gap-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{booking.customer}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          booking.status === 'rated' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{booking.service}</p>
                      <p className="text-sm text-gray-500">{booking.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-600">{booking.amount}</p>
                      <div className="flex gap-2 mt-2">
                        {booking.status === 'confirmed' && (
                          <>
                            <button className="px-3 py-1 bg-green-500 text-white text-sm rounded">Complete</button>
                            <button className="px-3 py-1 bg-red-500 text-white text-sm rounded">Cancel</button>
                          </>
                        )}
                        {booking.status === 'completed' && (
                          <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded">View Details</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {recentBookings.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-calendar text-gray-400 text-3xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No bookings yet</h3>
                <p className="text-gray-500">Your upcoming bookings will appear here</p>
              </div>
            )}
          </div>
        )}

        {activeSection === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h2>
              <p className="text-gray-600">Manage your professional information</p>
            </div>

            {/* Profile Form */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={helperData.name}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={helperData.email}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={helperData.phone}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
                  <input
                    type="text"
                    value={helperData.service}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    readOnly
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={helperData.location}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    readOnly
                  />
                </div>
              </div>

              {/* Statistics */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-600">{helperData.rating}/5</div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{helperData.totalJobs}</div>
                  <div className="text-sm text-gray-600">Jobs Completed</div>
                </div>
                <div className="text-center p-4 bg-teal-50 rounded-lg">
                  <div className="text-2xl font-bold text-teal-600">₹{helperData.weeklyEarnings.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Weekly Earnings</div>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <button className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:shadow-lg transition-all">
                  Update Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default HelperWelcomePage;
