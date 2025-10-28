import React from 'react';
import { useAuth } from '../../context/AuthContext';

const AccountPoints = () => {
  const { state } = useAuth();
  const coins = state?.user?.coinsEarned ?? state?.user?.profile?.coinsEarned ?? 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg border p-6">
      <h2 className="text-2xl font-semibold mb-4">My Points</h2>
      <div className="p-6 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white">
        <div className="text-4xl font-bold">{coins}</div>
        <div>RahaSeva Coins</div>
      </div>
      <div className="mt-6">
        <button className="px-4 py-2 bg-gray-900 text-white rounded-lg">Redeem (coming soon)</button>
      </div>
    </div>
  );
};

export default AccountPoints;
