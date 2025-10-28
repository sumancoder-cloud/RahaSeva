import React from 'react';
import { useAuth } from '../../context/AuthContext';

const AccountProfile = () => {
  const { state } = useAuth();
  const user = state?.user || {};
  const initials = (user?.name || 'U').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();

  return (
    <div className="bg-white rounded-2xl shadow-lg border p-6">
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-xl font-bold text-gray-700">
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div>
          <div className="text-2xl font-semibold text-gray-900">{user?.name}</div>
          <div className="text-gray-600">{user?.email}</div>
          {user?.phone && <div className="text-gray-600">{user.phone}</div>}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-xl">
          <div className="text-sm text-gray-500">Role</div>
          <div className="font-medium">{user?.role || 'user'}</div>
        </div>
        <div className="p-4 border rounded-xl">
          <div className="text-sm text-gray-500">Coins</div>
          <div className="font-medium">{user?.coinsEarned ?? user?.profile?.coinsEarned ?? 0}</div>
        </div>
        <div className="p-4 border rounded-xl">
          <div className="text-sm text-gray-500">Total Bookings</div>
          <div className="font-medium">{user?.totalBookings ?? user?.profile?.totalBookings ?? 0}</div>
        </div>
        <div className="p-4 border rounded-xl">
          <div className="text-sm text-gray-500">Completed</div>
          <div className="font-medium">{user?.completedBookings ?? user?.profile?.completedBookings ?? 0}</div>
        </div>
      </div>

      <div className="mt-6">
        <button className="px-4 py-2 border rounded-lg">Upload New Photo</button>
      </div>
    </div>
  );
};

export default AccountProfile;
