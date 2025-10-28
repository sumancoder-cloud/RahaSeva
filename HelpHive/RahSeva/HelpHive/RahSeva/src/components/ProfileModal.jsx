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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">My Profile</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center font-bold text-gray-700">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{user?.name}</div>
              <div className="text-sm text-gray-600">{user?.email}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {user?.phone && (
              <div className="p-3 rounded-lg border">
                <div className="text-xs text-gray-500">Phone</div>
                <div className="font-medium">{user.phone}</div>
              </div>
            )}
            <div className="p-3 rounded-lg border">
              <div className="text-xs text-gray-500">Role</div>
              <div className="font-medium">{user?.role || 'user'}</div>
            </div>
            <div className="p-3 rounded-lg border">
              <div className="text-xs text-gray-500">Coins</div>
              <div className="font-medium">{user?.coinsEarned ?? user?.profile?.coinsEarned ?? 0}</div>
            </div>
            <div className="p-3 rounded-lg border">
              <div className="text-xs text-gray-500">Total Bookings</div>
              <div className="font-medium">{user?.totalBookings ?? user?.profile?.totalBookings ?? 0}</div>
            </div>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex items-center justify-between gap-3">
            <label className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              {uploading ? 'Uploading...' : 'Upload New Photo'}
            </label>
            <button onClick={onClose} className="px-4 py-2 border rounded-lg">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
