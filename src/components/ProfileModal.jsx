import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ProfileModal = ({ isOpen, onClose }) => {
  const { state, updateUserProfile } = useAuth();
  const user = state?.user || {};
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const initials = (user?.name || 'U').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    try {
      setError('');
      setUploading(true);
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result;
        await updateUserProfile({ profilePicture: dataUrl });
        setUploading(false);
        onClose();
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploading(false);
      setError('Failed to upload image.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border-2 border-orange-400 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
              <i className="fas fa-user-circle mr-3 text-white/90"></i>
              My Profile
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-lg font-bold transition-all duration-300 hover:scale-110"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Picture & Basic Info */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl border-2 border-orange-200">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 overflow-hidden flex items-center justify-center shadow-xl transform transition-transform duration-300 hover:rotate-6 hover:scale-110">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <i className="fas fa-user text-white text-3xl"></i>
              )}
            </div>
            <div className="flex-1">
              <div className="text-xl font-black text-gray-900 mb-1" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
                {user?.name || 'User'}
              </div>
              <div className="text-sm font-semibold text-gray-600 mb-2">{user?.email}</div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 border-2 border-orange-400">
                <span className="text-xs font-black text-orange-700 capitalize">
                  {user?.role || 'user'}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-2xl border-2 border-orange-400 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <i className="fas fa-coins text-orange-500 text-lg"></i>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">RahaSeva Coins</div>
              </div>
              <div className="text-2xl font-black text-gray-900">
                {user?.coinsEarned ?? user?.profile?.coinsEarned ?? 0}
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border-2 border-pink-400 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <i className="fas fa-calendar-check text-pink-500 text-lg"></i>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Bookings</div>
              </div>
              <div className="text-2xl font-black text-gray-900">
                {user?.totalBookings ?? user?.profile?.totalBookings ?? 0}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          {user?.phone && (
            <div className="p-4 bg-white rounded-2xl border-2 border-emerald-400 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <i className="fas fa-phone text-emerald-500 text-lg"></i>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Phone Number</div>
              </div>
              <div className="text-lg font-black text-gray-900">{user.phone}</div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-400 rounded-2xl">
              <div className="flex items-center gap-2">
                <i className="fas fa-exclamation-triangle text-red-500"></i>
                <span className="text-sm font-semibold text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t-2 border-orange-200">
            <label className="flex-1 inline-flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold cursor-pointer">
              <i className="fas fa-camera text-white"></i>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <span>Update Photo</span>
              )}
            </label>

            <button
              onClick={onClose}
              className="px-6 py-3 border-2 border-orange-400 bg-white text-gray-900 rounded-xl hover:bg-orange-50 hover:border-orange-600 hover:scale-105 transition-all duration-300 font-black shadow-lg"
            >
              <i className="fas fa-times mr-2"></i>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
