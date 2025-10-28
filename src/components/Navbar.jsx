import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileModal from './ProfileModal';

const Navbar = () => {
  const navigate = useNavigate();
  const { state, logout } = useAuth();
  const { isAuthenticated, user, userRole } = state || {};
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

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
                  className="w-10 h-10 rounded-full bg-white/90 text-gray-800 font-bold flex items-center justify-center border-2 border-white hover:shadow-lg"
                  aria-haspopup="menu"
                  aria-expanded={isProfileOpen}
                >
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border p-2">
                    <div className="px-3 py-2 border-b">
                      <div className="font-semibold text-gray-900">{user?.name}</div>
                      <div className="text-sm text-gray-600 truncate">{user?.email}</div>
                    </div>
                    <button onClick={() => { setShowProfileModal(true); setIsProfileOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100">Profile</button>
                    <Link to="/account/bookings" className="block px-3 py-2 rounded-lg hover:bg-gray-100">My Bookings</Link>
                    <Link to="/account/points" className="block px-3 py-2 rounded-lg hover:bg-gray-100">My Points</Link>
                    <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-600">Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="nav-buttons flex gap-3 text-white font-semibold">
              <Link to="/signup">
                <button className="p-3 border-2 border-white rounded-full hover:text-green-500 transition-all">Sign Up</button>
              </Link>
              <Link to="/login">
                <button className="p-3 border-2 border-white rounded-full hover:text-pink-500 transition-all">Login</button>
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
