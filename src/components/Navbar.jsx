import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../context/translations';
import ProfileModal from './ProfileModal';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, logout } = useAuth();
  const { isAuthenticated, user, userRole } = state || {};
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Check if on auth pages (login, signup)
  const isAuthPage = location.pathname === '/login' || 
                     location.pathname === '/signup' || 
                     location.pathname === '/helper-login' || 
                     location.pathname === '/helper-signup';

  const initials = (user?.name || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Simplified navbar for auth pages
  if (isAuthPage) {
    return (
      <nav className="border-2 border-black w-full bg-gradient-to-r from-orange-500 to-pink-500 fixed top-0 z-50">
        <div className="flex justify-between items-center h-[70px] px-6">
          {/* Logo Only */}
          <Link to="/" className="flex items-center">
            <img 
              src="/assets/RahaSeva.png" 
              alt="RahaSeva Logo" 
              className="w-40 h-12 object-contain rounded-xl shadow-lg border-2 border-white/30 bg-white/10 backdrop-blur-sm" 
            />
          </Link>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/signup">
              <button className="px-6 py-3 border-2 border-white rounded-full text-white font-semibold hover:bg-white hover:text-orange-500 transition-all duration-300">
                Sign Up
              </button>
            </Link>
            <Link to="/login">
              <button className="px-6 py-3 border-2 border-white rounded-full text-white font-semibold hover:bg-white hover:text-pink-500 transition-all duration-300">
                Login
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white text-2xl" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <i className={`fa-solid ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-gradient-to-r from-orange-500 to-pink-500 border-t-2 border-white">
            <div className="flex flex-col gap-3 p-4">
              <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                <button className="w-full px-6 py-3 border-2 border-white rounded-full text-white font-semibold hover:bg-white hover:text-orange-500 transition-all">
                  Sign Up
                </button>
              </Link>
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                <button className="w-full px-6 py-3 border-2 border-white rounded-full text-white font-semibold hover:bg-white hover:text-pink-500 transition-all">
                  Login
                </button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    );
  }

  // Full navbar for other pages
  return (
    <nav className="border-2 border-black w-full bg-gradient-to-r from-orange-500 to-pink-500 fixed top-0 z-50">
      <div className="flex justify-between items-center h-[70px] p-2">
        <Link to={isAuthenticated ? `/welcome/${userRole === 'admin' ? 'admin' : userRole === 'helper' ? 'helper' : 'user'}` : '/'} className="flex items-center gap-2">
          <img src="/assets/RahaSeva.png" alt="RahaSeva Logo" className="w-40 h-12 object-contain rounded-xl shadow-lg border-2 border-white/30 bg-white/10 backdrop-blur-sm" />
          <span className="font-bold text-2xl text-white tracking-wide drop-shadow-lg">RahaSeva</span>
        </Link>

        <div className="hidden lg:flex items-center">
          <ul className="flex gap-6 text-white font-semibold items-center">
            {userRole !== 'helper' && (
              <li>
                <Link to="/welcome/user" className="hover:text-orange-200 transition-colors px-3 py-2 rounded">
                  Find Helper
                </Link>
              </li>
            )}
            <li className="relative group">
              <button className="hover:text-orange-200 transition-colors px-3 py-2 rounded">Categories</button>
              <div className="absolute mt-2 hidden group-hover:block bg-white text-gray-800 rounded-lg shadow-xl border min-w-[200px]">
                <Link to="/welcome/user" state={{ filter: 'plumber' }} className="block px-4 py-2 hover:bg-gray-100">Plumber</Link>
                <Link to="/welcome/user" state={{ filter: 'electrician' }} className="block px-4 py-2 hover:bg-gray-100">Electrician</Link>
                <Link to="/welcome/user" state={{ filter: 'carpenter' }} className="block px-4 py-2 hover:bg-gray-100">Carpenter</Link>
                <Link to="/welcome/user" state={{ filter: 'doctor' }} className="block px-4 py-2 hover:bg-gray-100">Doctor</Link>
                <Link to="/welcome/user" state={{ filter: 'emergency' }} className="block px-4 py-2 hover:bg-gray-100">Emergency</Link>
              </div>
            </li>
            {isAuthenticated && (
              <li>
                <Link to="/account" className="hover:text-orange-200 transition-colors px-3 py-2 rounded">My Account</Link>
              </li>
            )}
          </ul>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen((v) => !v)}
                  className="flex items-center gap-3 px-4 py-3 bg-white border-2 border-orange-400 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 hover:border-orange-600 transition-all duration-300"
                  aria-haspopup="menu"
                  aria-expanded={isProfileOpen}
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg transform transition-transform duration-300 hover:rotate-6 hover:scale-110">
                    {user?.profilePicture ? (
                      <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <i className="fas fa-user text-white text-lg"></i>
                    )}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-black text-gray-900" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
                      {user?.name?.split(' ')[0] || 'User'}
                    </div>
                    <div className="text-xs text-gray-600 font-semibold">
                      {userRole === 'admin' ? 'Admin' : userRole === 'helper' ? 'Helper' : 'User'}
                    </div>
                  </div>
                  <i className={`fas fa-chevron-down text-orange-500 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`}></i>
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border-2 border-orange-400 p-3 animate-fade-in">
                    <div className="px-4 py-3 border-b-2 border-orange-200 mb-2">
                      <div className="font-black text-gray-900 text-lg">{user?.name}</div>
                      <div className="text-sm text-gray-600 font-semibold truncate">{user?.email}</div>
                      <div className="text-xs text-orange-600 font-bold mt-1 capitalize">{userRole}</div>
                    </div>
                    <button onClick={() => { setShowProfileModal(true); setIsProfileOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-orange-50 text-gray-900 font-semibold flex items-center gap-3 transition-colors">
                      <i className="fas fa-user-circle text-orange-500 text-lg"></i>
                      Profile Settings
                    </button>
                    <Link to="/account/bookings" className="block px-4 py-3 rounded-xl hover:bg-orange-50 text-gray-900 font-semibold flex items-center gap-3 transition-colors" onClick={() => setIsProfileOpen(false)}>
                      <i className="fas fa-calendar text-orange-500 text-lg"></i>
                      My Bookings
                    </Link>
                    <Link to="/account/points" className="block px-4 py-3 rounded-xl hover:bg-orange-50 text-gray-900 font-semibold flex items-center gap-3 transition-colors" onClick={() => setIsProfileOpen(false)}>
                      <i className="fas fa-coins text-orange-500 text-lg"></i>
                      My Points
                    </Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 font-semibold flex items-center gap-3 transition-colors">
                      <i className="fas fa-sign-out-alt text-red-500 text-lg"></i>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="nav-buttons flex gap-4 text-white font-semibold">
              <Link to="/signup">
                <button className="px-6 py-3 border-2 border-white rounded-full hover:bg-white hover:text-orange-500 transition-all duration-300">
                  Sign Up
                </button>
              </Link>
              <Link to="/login">
                <button className="px-6 py-3 border-2 border-white rounded-full hover:bg-white hover:text-pink-500 transition-all duration-300">
                  Login
                </button>
              </Link>
            </div>
          )}
        </div>

        <button className="lg:hidden text-white cursor-pointer text-xl" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <i className={`fa-solid ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden bg-gradient-to-r from-orange-500 to-pink-500 border-t-2 border-white">
          <div className="p-3 space-y-2 text-white font-semibold">
            {userRole !== 'helper' && (
              <Link to="/welcome/user" className="block px-3 py-2 rounded hover:bg-white/10" onClick={() => setIsMenuOpen(false)}>
                Find Helper
              </Link>
            )}
            <div className="px-3 py-2">Categories</div>
            <div className="grid grid-cols-2 gap-2 px-3 pb-2">
              {['plumber','electrician','carpenter','doctor','emergency'].map((cat) => (
                <Link key={cat} to="/welcome/user" state={{ filter: cat }} className="px-3 py-2 rounded bg-white/10 text-center capitalize" onClick={() => setIsMenuOpen(false)}>
                  {cat}
                </Link>
              ))}
            </div>

            {isAuthenticated ? (
              <>
                <Link to="/account" className="block px-3 py-2 rounded hover:bg-white/10" onClick={() => setIsMenuOpen(false)}>My Account</Link>
                <Link to="/account/bookings" className="block px-3 py-2 rounded hover:bg-white/10" onClick={() => setIsMenuOpen(false)}>My Bookings</Link>
                <Link to="/account/points" className="block px-3 py-2 rounded hover:bg-white/10" onClick={() => setIsMenuOpen(false)}>My Points</Link>
                <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded hover:bg-red-50 text-red-100">Logout</button>
              </>
            ) : (
              <div className="flex gap-3 px-3 py-2">
                <Link to="/signup" className="flex-1">
                  <button className="w-full p-3 border-2 border-white rounded-full">Sign Up</button>
                </Link>
                <Link to="/login" className="flex-1">
                  <button className="w-full p-3 border-2 border-white rounded-full">Login</button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </nav>
  );
};

export default Navbar;
