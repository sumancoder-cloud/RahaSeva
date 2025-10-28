import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminWelcomePage = () => {
  const { logout, state } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-gradient-to-r from-slate-500 to-gray-500">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/RahaSeva.png" 
              alt="RahaSeva Logo" 
              className="w-12 h-12 object-contain rounded-lg"
            />
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-gray-600">RahaSeva Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-red-100 px-3 py-1 rounded-full">
              <span className="text-red-600 font-semibold text-sm">🔴 Super Admin</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gradient-to-r from-slate-500 to-gray-500 text-white rounded-lg hover:shadow-lg transition-all duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-gray-600">Dashboard</span>
          </h2>
          <p className="text-xl text-gray-700 mb-6">
            Complete control over RahaSeva platform - Monitor, Manage, and Optimize
          </p>
          
          {/* System Status */}
          <div className="inline-flex items-center bg-white rounded-xl p-4 shadow-lg border-2 border-green-200">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
            <span className="text-gray-700 font-semibold">System Status: All Services Operational</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          {/* Total Users */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Total Users</h3>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <i className="fas fa-users text-white"></i>
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">15,247</div>
            <p className="text-gray-600 text-sm">+12% this month</p>
          </div>

          {/* Active Helpers */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-green-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Active Helpers</h3>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <i className="fas fa-user-cog text-white"></i>
              </div>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">2,456</div>
            <p className="text-gray-600 text-sm">Online: 1,234</p>
          </div>

          {/* Total Revenue */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Monthly Revenue</h3>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <i className="fas fa-chart-line text-white"></i>
              </div>
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-2">₹8.5L</div>
            <p className="text-gray-600 text-sm">+25% growth</p>
          </div>

          {/* Active Bookings */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Active Bookings</h3>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                <i className="fas fa-calendar-check text-white"></i>
              </div>
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-2">1,456</div>
            <p className="text-gray-600 text-sm">Today: 234 completed</p>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          
          {/* User Management */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-blue-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto">
              <i className="fas fa-users-cog text-white text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">User Management</h3>
            <p className="text-gray-600 text-sm text-center mb-4">Manage users, verify accounts, handle disputes</p>
            <button className="w-full py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all">Manage Users</button>
          </div>

          {/* Helper Verification */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-green-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4 mx-auto">
              <i className="fas fa-shield-check text-white text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Helper Verification</h3>
            <p className="text-gray-600 text-sm text-center mb-4">Verify helper credentials, KYC, and licenses</p>
            <button className="w-full py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all">Verify Helpers</button>
          </div>

          {/* Analytics Dashboard */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-purple-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto">
              <i className="fas fa-chart-bar text-white text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Analytics</h3>
            <p className="text-gray-600 text-sm text-center mb-4">View detailed reports and platform analytics</p>
            <button className="w-full py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all">View Analytics</button>
          </div>
        </div>

        {/* Additional Admin Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          {/* Payment Management */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border-2 border-emerald-200">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mb-3 mx-auto">
              <i className="fas fa-credit-card text-white text-lg"></i>
            </div>
            <h4 className="font-bold text-gray-900 text-center mb-2">Payment Management</h4>
            <p className="text-gray-600 text-sm text-center">Monitor transactions and payouts</p>
          </div>

          {/* Content Moderation */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border-2 border-red-200">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mb-3 mx-auto">
              <i className="fas fa-flag text-white text-lg"></i>
            </div>
            <h4 className="font-bold text-gray-900 text-center mb-2">Content Moderation</h4>
            <p className="text-gray-600 text-sm text-center">Review reports and moderate content</p>
          </div>

          {/* System Settings */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border-2 border-gray-200">
            <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mb-3 mx-auto">
              <i className="fas fa-cog text-white text-lg"></i>
            </div>
            <h4 className="font-bold text-gray-900 text-center mb-2">System Settings</h4>
            <p className="text-gray-600 text-sm text-center">Configure platform settings</p>
          </div>

          {/* Emergency Monitor */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border-2 border-yellow-200">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mb-3 mx-auto">
              <i className="fas fa-exclamation-triangle text-white text-lg"></i>
            </div>
            <h4 className="font-bold text-gray-900 text-center mb-2">Emergency Monitor</h4>
            <p className="text-gray-600 text-sm text-center">Track emergency service requests</p>
          </div>
        </div>

        {/* Recent Admin Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Admin Activity</h3>
          <div className="space-y-4">
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <i className="fas fa-user-check text-white"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Helper verified</h4>
                  <p className="text-gray-600 text-sm">Ramesh Kumar - Electrician (Delhi)</p>
                </div>
              </div>
              <span className="text-gray-500 text-sm">10 min ago</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <i className="fas fa-money-bill-wave text-white"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Payment processed</h4>
                  <p className="text-gray-600 text-sm">₹25,000 weekly payout to helpers</p>
                </div>
              </div>
              <span className="text-gray-500 text-sm">2 hours ago</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                  <i className="fas fa-exclamation-circle text-white"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Emergency request handled</h4>
                  <p className="text-gray-600 text-sm">Medical emergency in Bangalore - resolved</p>
                </div>
              </div>
              <span className="text-gray-500 text-sm">3 hours ago</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <i className="fas fa-chart-line text-white"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Monthly report generated</h4>
                  <p className="text-gray-600 text-sm">Platform performance analytics updated</p>
                </div>
              </div>
              <span className="text-gray-500 text-sm">1 day ago</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminWelcomePage;
