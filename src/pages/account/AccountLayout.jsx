import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const AccountLayout = () => {
  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="bg-white rounded-2xl shadow-lg border p-4 mb-4">
        <div className="flex gap-2">
          <NavLink to="/account" end className={({ isActive }) => `px-4 py-2 rounded-lg ${isActive ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>Profile</NavLink>
          <NavLink to="/account/bookings" className={({ isActive }) => `px-4 py-2 rounded-lg ${isActive ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>My Bookings</NavLink>
          <NavLink to="/account/points" className={({ isActive }) => `px-4 py-2 rounded-lg ${isActive ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>My Points</NavLink>
        </div>
      </div>
      <Outlet />
    </div>
  );
};

export default AccountLayout;
