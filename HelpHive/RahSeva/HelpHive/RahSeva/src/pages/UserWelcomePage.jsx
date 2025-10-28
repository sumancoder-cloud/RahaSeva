


import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Add CSS for hover effects
const mapStyles = `
  .provider-marker:hover .provider-tooltip {
    opacity: 1 !important;
  }
`;

// Inject styles into document head
if (typeof document !== 'undefined' && !document.getElementById('map-styles')) {
  const style = document.createElement('style');
  style.id = 'map-styles';
  style.textContent = mapStyles;
  document.head.appendChild(style);
}

const UserWelcomePage = () => {
  const { logout, state } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedService, setSelectedService] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showBookingPopup, setShowBookingPopup] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    serviceType: '',
    problemDescription: '',
    urgency: 'normal',
    location: '',
    budget: '',
    coordinates: null
  });
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [serviceProviders, setServiceProviders] = useState({});
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [userData, setUserData] = useState({
    name: 'Loading...',
    email: '',
    phone: '',
    location: '',
    joinDate: '',
    coinsEarned: 0,
    totalBookings: 0,
    completedBookings: 0
  });
  const mountedRef = useRef(true);

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

  // Load user profile data - Run only once when component mounts
  useEffect(() => {
    if (dataLoaded) return; // Prevent multiple API calls
    
    const loadUserData = async () => {
      try {
        if (state.isAuthenticated && state.user) {
          // Use user data from auth context if available
          const fallbackData = {
            name: state.user.name || 'User',
            email: state.user.email || '',
            phone: '',
            location: 'Hyderabad, Telangana',
            joinDate: new Date().toISOString().split('T')[0],
            coinsEarned: 250,
            totalBookings: 3,
            completedBookings: 2
          };
          
          if (state.user.profile) {
            setUserData({
              ...fallbackData,
              phone: state.user.profile.phone || '',
              location: state.user.profile.location || 'Hyderabad, Telangana',
              joinDate: state.user.profile.joinDate || fallbackData.joinDate,
              coinsEarned: state.user.profile.coinsEarned || 250,
              totalBookings: state.user.profile.totalBookings || 3,
              completedBookings: state.user.profile.completedBookings || 2
            });
            setDataLoaded(true);
          } else {
            // Try to fetch profile from API with improved timeout handling
            try {
              const profileData = await apiCall('/auth/profile');
              
              if (profileData && profileData.user && mountedRef.current) {
                setUserData({
                  name: profileData.user.name || fallbackData.name,
                  email: profileData.user.email || fallbackData.email,
                  phone: profileData.user.phone || fallbackData.phone,
                  location: profileData.user.location || fallbackData.location,
                  joinDate: profileData.user.joinDate || fallbackData.joinDate,
                  coinsEarned: profileData.user.coinsEarned || fallbackData.coinsEarned,
                  totalBookings: profileData.user.totalBookings || fallbackData.totalBookings,
                  completedBookings: profileData.user.completedBookings || fallbackData.completedBookings
                });
              }
            } catch (apiError) {
              // Silently use fallback data - don't log AbortErrors
              if (apiError.name !== 'AbortError') {
                console.warn('API call failed, using fallback data:', apiError.message);
              }
              if (mountedRef.current) {
                setUserData(fallbackData);
              }
            } finally {
              if (mountedRef.current) {
                setDataLoaded(true);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        if (mountedRef.current) {
          setUserData({
            name: state.user?.name || 'User',
            email: state.user?.email || '',
            phone: '',
            location: 'Hyderabad, Telangana',
            joinDate: new Date().toISOString().split('T')[0],
            coinsEarned: 250,
            totalBookings: 3,
            completedBookings: 2
          });
          setDataLoaded(true);
        }
      }
    };

    if (state.isAuthenticated && state.user) {
      loadUserData();
    }
  }, [state.isAuthenticated, state.user, dataLoaded]);

  const bookingsFetchedRef = useRef(false);

  // Load booking history - throttled to avoid flooding
  useEffect(() => {
    const loadBookingHistory = async () => {
      // Always use fallback data first for stable UI
      const fallbackBookings = [
        { id: 1, service: 'Plumber', provider: 'Ravi Kumar', date: '2024-01-15', status: 'Completed', amount: '₹299' },
        { id: 2, service: 'Doctor', provider: 'Dr. Priya Sharma', date: '2024-01-10', status: 'Completed', amount: '₹500' },
        { id: 3, service: 'Electrician', provider: 'Electrical Solutions', date: '2024-01-08', status: 'In Progress', amount: '₹300' }
      ];
      
      if (mountedRef.current) {
        setBookingHistory(fallbackBookings);
      }
      
      // Try to fetch from API in background (optional)
      if (state.isAuthenticated && !bookingsFetchedRef.current) {
        try {
          const bookingsData = await apiCall('/bookings');
          
          if (bookingsData && bookingsData.bookings && mountedRef.current) {
            setBookingHistory(bookingsData.bookings);
            bookingsFetchedRef.current = true;
          }
        } catch (error) {
          // Silently use fallback data - don't log AbortErrors
          if (error.name !== 'AbortError') {
            console.warn('Booking API unavailable, using fallback data:', error.message);
          }
          // Keep fallback data - no need to set again
        }
      }
    };

    if (!bookingsFetchedRef.current) {
      loadBookingHistory();
    }
  }, [state.isAuthenticated]);

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleLogout = () => {
    console.log('Logout initiated.');
    logout();
    navigate('/');
  };

  const handleServiceSelect = (serviceType) => {
    setSelectedService(serviceType);
    setShowServiceForm(true);
    setActiveSection('services');
  };

  const handleServiceFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Show success toast
      toast.success('Service request submitted successfully! Finding helpers near you...', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Use actual coordinates if available, otherwise use default Hyderabad coordinates
      const lat = serviceForm.coordinates?.latitude || 17.385044;
      const lng = serviceForm.coordinates?.longitude || 78.486671;
      
      // Fetch nearby service providers from database
      const params = new URLSearchParams({
        serviceType: serviceForm.serviceType,
        latitude: lat.toString(),
        longitude: lng.toString(),
        radius: '10'
      });
      
      const providersData = await apiCall(`/services/providers?${params}`);
      
      if (providersData.success !== false && providersData.providers && providersData.providers.length > 0) {
        // Use real data from MongoDB
        setServiceProviders({
          ...serviceProviders,
          [serviceForm.serviceType]: providersData.providers
        });
        
        toast.success(`Found ${providersData.providers.length} ${serviceForm.serviceType}s near you!`, {
          position: "top-right",
          autoClose: 2000,
        });
      } else {
        // If no providers found, create some in the database
        console.warn('No providers found, attempting to create mock data...');
        
        try {
          await apiCall('/services/mock-providers', { method: 'POST' });
          // Retry fetching providers
          const retryProvidersData = await apiCall(`/services/providers?${params}`);
          
          if (retryProvidersData.success !== false && retryProvidersData.providers) {
            setServiceProviders({
              ...serviceProviders,
              [serviceForm.serviceType]: retryProvidersData.providers
            });
            
            toast.success(`Found ${retryProvidersData.providers.length} ${serviceForm.serviceType}s near you!`, {
              position: "top-right",
              autoClose: 2000,
            });
          } else {
            toast.warning('No service providers found in your area. Please try a different location.', {
              position: "top-right",
              autoClose: 4000,
            });
          }
        } catch (createError) {
          console.error('Error creating mock providers:', createError);
          toast.warning('No service providers found in your area. Please try again later.', {
            position: "top-right",
            autoClose: 4000,
          });
        }
      }
      
      setShowServiceForm(false);
      setShowMap(true);
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast.error('Failed to load service providers. Please check your connection and try again.', {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Open-source map via simple static tile (OSM leaflet-like layout fallback)
  const MapComponent = ({ providers = [], selectedService }) => {
    const positions = [
      { top: '25%', left: '25%' },
      { top: '30%', left: '70%' },
      { top: '65%', left: '35%' },
      { top: '70%', left: '75%' },
      { top: '40%', left: '20%' }
    ];

    const handleProviderClick = (provider) => {
      handleProviderSelect(provider);
    };

    return (
      <div style={{
        width: '100%',
        height: '400px',
        background: '#eef2ff',
        borderRadius: '12px',
        position: 'relative',
        overflow: 'hidden',
        border: '2px solid #10B981',
        boxShadow: '0 4px 20px rgba(16, 185, 129, 0.1)'
      }}>
        {/* OSM Tile backdrop placeholder */}
        <img
          alt="map"
          src={`https://tile.openstreetmap.org/10/885/513.png`}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.1) brightness(1.05)' }}
        />
        
        {/* Your Location */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '20px',
          height: '20px',
          background: '#EF4444',
          border: '3px solid #FFFFFF',
          borderRadius: '50%',
          boxShadow: '0 2px 10px rgba(239, 68, 68, 0.4)',
          zIndex: 10
        }}>
          <div style={{
            position: 'absolute',
            top: '-30px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#1F2937',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>
            📍 Your Location
          </div>
        </div>
        
        {/* Service Providers */}
        {providers.map((provider, index) => {
          const position = positions[index % positions.length];
          const isVerified = provider.verified || provider.isVerified;
          
          return (
            <div
              key={provider.id || index}
              className="provider-marker"
              style={{
                position: 'absolute',
                top: position.top,
                left: position.left,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
                zIndex: 5
              }}
              onClick={() => handleProviderClick(provider)}
            >
              <div style={{
                width: '14px',
                height: '14px',
                background: isVerified ? '#10B981' : '#F59E0B',
                border: '2px solid #FFFFFF',
                borderRadius: '50%',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}></div>
              <div 
                className="provider-tooltip"
                style={{
                  position: 'absolute',
                  top: '-35px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: isVerified ? '#10B981' : '#F59E0B',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  opacity: 0,
                  transition: 'opacity 0.2s ease'
                }}
              >
                {provider.name} - {provider.price}
              </div>
            </div>
          );
        })}
        
        {/* Map Info */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#374151',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div><strong>Search Radius:</strong> 10km</div>
          <div><strong>Service:</strong> {selectedService || 'All Services'}</div>
          <div><strong>Providers Found:</strong> {providers.length}</div>
        </div>
      </div>
    );
  };

  // Basic WebRTC video modal (no keys needed)
  const VideoModal = ({ open, onClose }) => {
    const localVideoRef = useRef(null);
    useEffect(() => {
      let stream;
      const start = async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        } catch (e) {
          console.error('getUserMedia error', e);
        }
      };
      if (open) start();
      return () => {
        if (stream) stream.getTracks().forEach(t => t.stop());
      };
    }, [open]);
    if (!open) return null;
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-4 w-full max-w-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="text-lg font-semibold">Video Consultation</div>
            <button onClick={onClose} className="px-3 py-1 border rounded-lg">Close</button>
          </div>
          <video ref={localVideoRef} autoPlay playsInline className="w-full rounded-xl bg-black" />
          <div className="mt-3 text-sm text-gray-600">This demo opens your camera/mic locally using WebRTC. For real calls, pair with a signaling server (e.g., WebSocket) and STUN/TURN (e.g., Google STUN).</div>
        </div>
      </div>
    );
  };

  // Initialize Canvas-based map when map becomes visible - REMOVED DOM MANIPULATION
  useEffect(() => {
    if (showMap) {
      setMapInitialized(true);
    }
  }, [showMap]);

  const handleFormChange = (e) => {
    setServiceForm({
      ...serviceForm,
      [e.target.name]: e.target.value
    });
  };

  // Get user's current location
  const getCurrentLocation = () => {
    setGettingLocation(true);
    
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser.', {
        position: "top-right",
        autoClose: 3000,
      });
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding to get address
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY&no_annotations=1`
          );
          
          if (response.ok) {
            const data = await response.json();
            const address = data.results[0]?.formatted || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            
            setServiceForm({
              ...serviceForm,
              location: address,
              coordinates: { latitude, longitude }
            });
            
            toast.success('Location detected successfully!', {
              position: "top-right",
              autoClose: 2000,
            });
          } else {
            // Fallback to coordinates if reverse geocoding fails
            const address = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;
            setServiceForm({
              ...serviceForm,
              location: address,
              coordinates: { latitude, longitude }
            });
            
            toast.success('Location coordinates detected!', {
              position: "top-right",
              autoClose: 2000,
            });
          }
        } catch (error) {
          console.error('Error getting address:', error);
          // Use coordinates as fallback
          const address = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;
          setServiceForm({
            ...serviceForm,
            location: address,
            coordinates: { latitude, longitude }
          });
          
          toast.success('Location coordinates detected!', {
            position: "top-right",
            autoClose: 2000,
          });
        }
        
        setGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        let errorMessage = 'Unable to detect location.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 3000,
        });
        
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: false, // Reduce accuracy for faster response
        timeout: 15000, // Increase timeout to 15 seconds
        maximumAge: 300000 // Use cached location for 5 minutes
      }
    );
  };

  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider);
    setShowBookingPopup(true);
  };

  const handleBookService = async (bookingType) => {
    setLoading(true);
    
    try {
      // Create booking via API
      const bookingData = {
        providerId: selectedProvider.id,
        serviceType: selectedService,
        problemDescription: serviceForm.problemDescription || 'Service request',
        urgency: serviceForm.urgency || 'normal',
        bookingType: bookingType,
        location: serviceForm.location || userData.location,
        baseAmount: parseInt(selectedProvider.price.replace(/₹|\D/g, '')) || 500
      };
      
      const response = await apiCall('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData)
      });
      
      if (response.success !== false && response.booking) {
        // Add to local booking history
        const newBooking = {
          id: response.booking.id,
          service: response.booking.service,
          provider: response.booking.provider,
          date: response.booking.date,
          status: response.booking.status,
          amount: response.booking.amount,
          type: response.booking.type
        };
        setBookingHistory([newBooking, ...bookingHistory]);
        
        // Update user booking count
        setUserData(prev => ({
          ...prev,
          totalBookings: prev.totalBookings + 1,
          coinsEarned: prev.coinsEarned + 5 // Bonus coins for booking
        }));
        
        toast.success(`${bookingType} booked successfully with ${selectedProvider.name}!`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        throw new Error(response.msg || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      
      // Fallback: add to local state anyway for demo purposes
      const fallbackBooking = {
        id: Date.now(),
        service: selectedService,
        provider: selectedProvider.name,
        date: new Date().toISOString().split('T')[0],
        status: 'Confirmed',
        amount: selectedProvider.price,
        type: bookingType
      };
      setBookingHistory([fallbackBooking, ...bookingHistory]);
      
      toast.warning(`${bookingType} request created (offline mode). Please check your connection.`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
      setShowBookingPopup(false);
      setSelectedProvider(null);
    }
  };

  const renderDashboard = () => (
    <div className="text-center mb-12">
      <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
        Welcome{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
          {userData.name}!
        </span>
      </h1>
      <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-10">
        Find and book trusted local services within 10 km. Video consults, live tracking, emergency mode, and rewards built in.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
        <button className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-semibold">
          🚨 Emergency Mode
        </button>
        <button onClick={() => setShowVideoModal(true)} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-semibold">
          🎥 Video Consultation
        </button>
        <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-semibold">
          💰 Wallet & Rewards ({userData.coinsEarned})
        </button>
        <button className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-semibold">
          📊 Cost Estimator
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="text-center bg-white p-6 rounded-2xl shadow-lg border-2 border-orange-200">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-map-marker-alt text-white text-xl"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Location-based Search</h3>
          <p className="text-gray-600 text-sm">Auto-detect location to find services within 10 km</p>
        </div>
        <div className="text-center bg-white p-6 rounded-2xl shadow-lg border-2 border-pink-200">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-calendar-check text-white text-xl"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Booking System</h3>
          <p className="text-gray-600 text-sm">Time slots, emergency option, and confirmations</p>
        </div>
        <div className="text-center bg-white p-6 rounded-2xl shadow-lg border-2 border-emerald-200">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-location-arrow text-white text-xl"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Live Tracking</h3>
          <p className="text-gray-600 text-sm">Track provider arrival in real-time</p>
        </div>
        <div className="text-center bg-white p-6 rounded-2xl shadow-lg border-2 border-indigo-200">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-language text-white text-xl"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Multi-language</h3>
          <p className="text-gray-600 text-sm">Use the app in your local language</p>
        </div>
      </div>
    </div>
  );

  const renderServicesSection = () => (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Request <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">Service</span>
          </h2>
          <p className="text-xl text-gray-600">Fill in the details to find the best helpers near you</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl border-2 border-orange-200 p-8">
          <form onSubmit={handleServiceFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Service Type</label>
                <select
                  name="serviceType"
                  value={serviceForm.serviceType}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                >
                  <option value="">Select Service</option>
                  <option value="plumber">Plumber</option>
                  <option value="electrician">Electrician</option>
                  <option value="carpenter">Carpenter</option>
                  <option value="doctor">Doctor</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Urgency Level</label>
                <select
                  name="urgency"
                  value={serviceForm.urgency}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Problem Description</label>
              <textarea
                name="problemDescription"
                value={serviceForm.problemDescription}
                onChange={handleFormChange}
                required
                rows={4}
                placeholder="Please describe your problem in detail..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Location</label>
                <div className="relative">
                  <input
                    type="text"
                    name="location"
                    value={serviceForm.location}
                    onChange={handleFormChange}
                    required
                    placeholder="Enter your address or click 'Get Current Location'"
                    className="w-full px-4 py-3 pr-32 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={gettingLocation}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs rounded-lg hover:shadow-md transition-all duration-300 disabled:opacity-50"
                  >
                    {gettingLocation ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                        <span>Getting...</span>
                      </div>
                    ) : (
                      <>
                        <i className="fas fa-map-marker-alt mr-1"></i>
                        Current
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Budget Range</label>
                <select
                  name="budget"
                  value={serviceForm.budget}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                >
                  <option value="">Any Budget</option>
                  <option value="200-300">₹200 - ₹300</option>
                  <option value="300-500">₹300 - ₹500</option>
                  <option value="500-1000">₹500 - ₹1000</option>
                  <option value="1000+">₹1000+</option>
                </select>
              </div>
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 font-semibold text-lg"
              >
                Find Helpers
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );

  const renderMyAccount = () => (
    <section className="py-20 bg-gradient-to-br from-orange-50 via-pink-50 to-orange-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            My <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">Account</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <i className="fas fa-user text-orange-500 mr-3"></i>
              Profile Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Full Name</label>
                <p className="text-lg text-gray-900">{userData.name}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Email</label>
                <p className="text-lg text-gray-900">{userData.email}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Phone</label>
                <p className="text-lg text-gray-900">{userData.phone}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Location</label>
                <p className="text-lg text-gray-900">{userData.location}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Member Since</label>
                <p className="text-lg text-gray-900">{userData.joinDate}</p>
              </div>
            </div>
          </div>

          {/* Coins & Stats */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-pink-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <i className="fas fa-coins text-pink-500 mr-3"></i>
              Rewards & Stats
            </h3>
            <div className="space-y-6">
              <div className="text-center bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl p-6 text-white">
                <div className="text-4xl font-bold mb-2">{userData.coinsEarned}</div>
                <div className="text-lg">RahaSeva Coins</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center bg-orange-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-orange-500">{userData.totalBookings}</div>
                  <div className="text-sm text-gray-600">Total Bookings</div>
                </div>
                <div className="text-center bg-pink-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-pink-500">{userData.completedBookings}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
              </div>

              <div className="text-center">
                <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all">
                  Redeem Coins
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const renderMyBookings = () => (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            My <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">Bookings</span>
          </h2>
          <p className="text-xl text-gray-600">Track your service booking history and status</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-6">
            <h3 className="text-2xl font-bold text-white">Booking History</h3>
          </div>
          
          <div className="p-6">
            {bookingHistory.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-calendar-times text-6xl text-gray-400 mb-4"></i>
                <p className="text-xl text-gray-600">No bookings yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookingHistory.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h4 className="text-xl font-bold text-gray-900 mr-4">{booking.service}</h4>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            booking.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            booking.status === 'Confirmed' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-1">
                          <i className="fas fa-user mr-2 text-orange-500"></i>
                          Provider: {booking.provider}
                        </p>
                        <p className="text-gray-600 mb-1">
                          <i className="fas fa-calendar mr-2 text-orange-500"></i>
                          Date: {booking.date}
                        </p>
                        {booking.type && (
                          <p className="text-gray-600">
                            <i className="fas fa-info-circle mr-2 text-orange-500"></i>
                            Type: {booking.type}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{booking.amount}</div>
                        <button className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-orange-100">
      {/* Main Content - Navbar is global now */}
      <div>
        {/* Render content based on active section */}
        {activeSection === 'dashboard' && (
          <>
            {/* Welcome Hero Section */}
            <section className="py-16 bg-gradient-to-br from-orange-50 via-pink-50 to-orange-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {renderDashboard()}
              </div>
            </section>

            {/* Service Categories - Same styling as Landing Page */}
            <section className="py-20 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">Services</span>
                  </h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    We connect you with verified professionals for all your needs
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Home Services */}
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl border-2 border-orange-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                      <i className="fas fa-home text-white text-2xl"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Home Services</h3>
                    <p className="text-gray-600 mb-4">
                      Professional plumbing, electrical, and carpentry services for all your home needs.
                    </p>
                    <button 
                      onClick={() => handleServiceSelect('plumber')}
                      className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 font-semibold"
                    >
                      Find Helpers
                    </button>
                  </div>

                  {/* Healthcare */}
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-8 rounded-2xl border-2 border-pink-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                      <i className="fas fa-user-md text-white text-2xl"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Healthcare</h3>
                    <p className="text-gray-600 mb-4">
                      Expert doctors, hospitals, and healthcare professionals for your wellbeing.
                    </p>
                    <button 
                      onClick={() => handleServiceSelect('doctor')}
                      className="w-full py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 font-semibold"
                    >
                      Find Helpers
                    </button>
                  </div>

                  {/* Emergency Services */}
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl border-2 border-orange-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                      <i className="fas fa-ambulance text-white text-2xl"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Emergency</h3>
                    <p className="text-gray-600 mb-4">
                      24/7 emergency services including ambulance and urgent repairs.
                    </p>
                    <button 
                      onClick={() => handleServiceSelect('emergency')}
                      className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 font-semibold"
                    >
                      Find Helpers
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Features aligned with proposal */}
            <section className="py-20 bg-gradient-to-br from-orange-50 via-pink-50 to-orange-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">HelpHive?</span>
                  </h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">One-stop home services + healthcare with emergency mode, video + AR, and rewards.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="text-center bg-white p-6 rounded-2xl shadow-lg border-2 border-orange-200">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-map-marker-alt text-white text-xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Emergency Mode</h3>
                    <p className="text-gray-600 text-sm">Instant connect to nearest provider</p>
                  </div>

                  <div className="text-center bg-white p-6 rounded-2xl shadow-lg border-2 border-pink-200">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-video text-white text-xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Video + AR</h3>
                    <p className="text-gray-600 text-sm">Video consults with AR annotations</p>
                  </div>

                  <div className="text-center bg-white p-6 rounded-2xl shadow-lg border-2 border-orange-200">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-certificate text-white text-xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Verified Providers</h3>
                    <p className="text-gray-600 text-sm">KYC badges, ratings, trust & safety</p>
                  </div>

                  <div className="text-center bg-white p-6 rounded-2xl shadow-lg border-2 border-pink-200">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-coins text-white text-xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Wallet & Rewards</h3>
                    <p className="text-gray-600 text-sm">Earn and redeem points on bookings</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <section className="py-20 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    Quick <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">Actions</span>
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <button 
                    onClick={() => setActiveSection('services')}
                    className="p-8 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-search text-white text-2xl"></i>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Find Services</h4>
                    <p className="text-gray-600">Browse nearby providers</p>
                  </button>
                  
                  <button 
                    onClick={() => setActiveSection('bookings')}
                    className="p-8 bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-200 rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-calendar text-white text-2xl"></i>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">My Bookings</h4>
                    <p className="text-gray-600">View and manage appointments</p>
                  </button>
                  
                  <button 
                    onClick={() => setActiveSection('account')}
                    className="p-8 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-wallet text-white text-2xl"></i>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">RahaSeva Wallet</h4>
                    <p className="text-gray-600">Check balance and rewards</p>
                  </button>
                </div>
              </div>
            </section>
          </>
        )}

        {activeSection === 'services' && !showMap && renderServicesSection()}
        {activeSection === 'account' && renderMyAccount()}
        {activeSection === 'bookings' && renderMyBookings()}

        {/* Dynamic Content Based on Active Section */}
        {activeSection === 'services' && showMap && (
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Available <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">{selectedService}s</span> Near You
                </h2>
                <p className="text-xl text-gray-600">Within 10km radius from your location</p>
              </div>

              {/* Interactive Polymaps Integration */}
              <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-8 mb-8 border-2 border-orange-200">
                <div className="bg-white rounded-xl p-6 mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <i className="fas fa-map-marker-alt text-orange-500 mr-3"></i>
                    Live Map View - 10km Radius
                  </h3>
                  <div className="h-96 rounded-lg border-2 border-gray-300 relative overflow-hidden">
                    {mapInitialized ? (
                      <MapComponent 
                        providers={serviceProviders[selectedService] || []} 
                        selectedService={selectedService}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                          <p className="text-xl text-gray-600 mb-2">Loading Interactive Map...</p>
                          <p className="text-gray-500">Custom Map Implementation</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex justify-center space-x-4">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">Verified Providers</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">Unverified</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">Your Location</span>
                    </div>
                  </div>
                </div>

                {/* Service Providers List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {serviceProviders[selectedService]?.map((provider) => (
                    <div key={provider.id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 mb-1">{provider.name}</h4>
                          <div className="flex items-center mb-2">
                            <div className="flex text-yellow-400 mr-2">
                              ⭐⭐⭐⭐⭐
                            </div>
                            <span className="text-gray-600 text-sm">{provider.rating} ({Math.floor(Math.random() * 100) + 50} reviews)</span>
                          </div>
                          <div className="flex items-center text-gray-600 text-sm mb-2">
                            <i className="fas fa-map-marker-alt mr-2 text-orange-500"></i>
                            {provider.distance} away
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <i className="fas fa-rupee-sign mr-2 text-green-500"></i>
                            {provider.price}
                          </div>
                        </div>
                        {provider.verified && (
                          <div className="flex flex-col items-center">
                            <i className="fas fa-certificate text-green-500 text-2xl mb-1"></i>
                            <span className="text-xs text-green-600 font-semibold">Verified</span>
                          </div>
                        )}
                      </div>
                      
                      <button 
                        onClick={() => handleProviderSelect(provider)}
                        className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold"
                      >
                        Select Provider
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Booking Options Popup */}
        {showBookingPopup && selectedProvider && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Book Service</h3>
                <p className="text-gray-600">Choose how you want to connect with {selectedProvider.name}</p>
              </div>
              
              <div className="space-y-4">
                <button 
                  onClick={() => handleBookService('In-Person Visit')}
                  className="w-full p-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                >
                  <i className="fas fa-home mr-3 text-xl"></i>
                  <div className="text-left">
                    <div className="font-bold">Book In-Person Visit</div>
                    <div className="text-sm opacity-90">Provider comes to your location</div>
                  </div>
                </button>
                
                <button 
                  onClick={() => handleBookService('Video Consultation')}
                  className="w-full p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                >
                  <i className="fas fa-video mr-3 text-xl"></i>
                  <div className="text-left">
                    <div className="font-bold">Video Consultation</div>
                    <div className="text-sm opacity-90">Get help via video call + AR guidance</div>
                  </div>
                </button>
                
                <button 
                  onClick={() => handleBookService('Emergency Call')}
                  className="w-full p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                >
                  <i className="fas fa-phone mr-3 text-xl"></i>
                  <div className="text-left">
                    <div className="font-bold">Emergency Call</div>
                    <div className="text-sm opacity-90">Immediate phone consultation</div>
                  </div>
                </button>
              </div>
              
              <button 
                onClick={() => setShowBookingPopup(false)}
                className="w-full mt-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Toast Container for notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {/* Video Modal */}
      <VideoModal open={showVideoModal} onClose={() => setShowVideoModal(false)} />
    </div>
  );
};

export default UserWelcomePage;
