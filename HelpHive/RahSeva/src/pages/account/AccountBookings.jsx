import React, { useEffect, useState } from 'react';

const AccountBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/bookings', {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        });
        const data = await res.json();
        if (res.ok && data?.bookings) {
          setBookings(data.bookings);
        } else {
          setBookings([]);
        }
      } catch (e) {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg border p-6">
      <h2 className="text-2xl font-semibold mb-4">My Bookings</h2>
      {loading ? (
        <div>Loading...</div>
      ) : bookings.length === 0 ? (
        <div className="text-gray-600">No bookings yet.</div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id || b._id} className="p-4 border rounded-xl flex items-center justify-between">
              <div>
                <div className="font-semibold">{b.service || b.serviceDetails?.serviceType}</div>
                <div className="text-sm text-gray-600">{b.provider || b.providerName}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">{b.date || b.formattedDate}</div>
                <div className="font-medium">{b.amount || (b.pricing ? `₹${b.pricing.totalAmount}` : '')}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountBookings;
