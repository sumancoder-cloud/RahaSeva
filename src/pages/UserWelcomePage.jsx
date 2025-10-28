


import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  const [serviceDiscoveryMode, setServiceDiscoveryMode] = useState('own-database'); // 'own-database' or 'google-places'
  const [googlePlacesResults, setGooglePlacesResults] = useState([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [showProviderRegistration, setShowProviderRegistration] = useState(false);
  const [providerForm, setProviderForm] = useState({
    businessName: '',
    serviceType: '',
    description: '',
    experience: '',
    pricePerHour: '',
    phone: '',
    address: '',
    city: '',
    state: ''
  });
  const mountedRef = useRef(true);

  // Redeem modal state (wallet UI)
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState(0);

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
      // Use actual coordinates if available, otherwise use default Hyderabad coordinates
      const lat = serviceForm.coordinates?.latitude || 17.385044;
      const lng = serviceForm.coordinates?.longitude || 78.486671;
      
      if (serviceDiscoveryMode === 'google-places') {
        // Google Places API mode
        await searchGooglePlaces(serviceForm.serviceType, lat, lng);
      } else {
        // Own database mode
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

  // Google Places API search function
  const searchGooglePlaces = async (serviceType, lat, lng) => {
    setLoadingPlaces(true);
    
    try {
      // Map service types to Google Places types
      const placesTypeMap = {
        plumber: 'plumber',
        electrician: 'electrician',
        carpenter: 'carpenter',
        doctor: 'doctor',
        emergency: 'hospital'
      };

      const placesType = placesTypeMap[serviceType] || serviceType;
      
      // Use a free geocoding service for reverse geocoding (no API key needed)
      const locationQuery = `${lat},${lng}`;
      
      // Create mock Google Places results (since we can't use actual API without key)
      // In production, you would use: https://maps.googleapis.com/maps/api/place/nearbysearch/json
      const mockPlacesResults = generateMockGooglePlaces(serviceType, lat, lng);
      
      setGooglePlacesResults(mockPlacesResults);
      setServiceProviders({
        ...serviceProviders,
        [serviceType]: mockPlacesResults
      });
      
      toast.success(`Found ${mockPlacesResults.length} ${serviceType} places near you!`, {
        position: "top-right",
        autoClose: 2000,
      });
      
    } catch (error) {
      console.error('Error searching Google Places:', error);
      toast.error('Failed to search Google Places. Please try again.', {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoadingPlaces(false);
    }
  };

  // Generate mock Google Places results
  const generateMockGooglePlaces = (serviceType, lat, lng) => {
    const placesTemplates = {
      plumber: [
        // Add Suman's sample data first
        {
          id: 'suman_plumber_001',
          name: 'Suman Plumbing Services',
          rating: 4.8,
          price: '₹300/hour',
          phone: '7997596790',
          distance: '2.3 km',
          verified: true,
          reviews: 127,
          experience: '8 years',
          address: 'Main Road, Kadapa, Andhra Pradesh',
          lat: lat + 0.01,
          lng: lng + 0.01,
          isGooglePlace: false // This is our database provider
        },
        { name: 'Quick Fix Plumbing Services', rating: 4.2, price: '₹200-400', address: 'MG Road, Bangalore' },
        { name: 'Expert Pipe Solutions', rating: 4.5, price: '₹250-500', address: 'Brigade Road, Bangalore' },
        { name: 'Home Plumbing Care', rating: 4.0, price: '₹180-350', address: 'Indiranagar, Bangalore' },
        { name: 'Professional Drain Services', rating: 4.3, price: '₹220-450', address: 'Koramangala, Bangalore' },
        { name: '24/7 Plumbing Solutions', rating: 4.1, price: '₹300-600', address: 'HSR Layout, Bangalore' }
      ],
      electrician: [
        { name: 'Power Solutions Electrical', rating: 4.4, price: '₹250-500', address: 'Commercial Street, Bangalore' },
        { name: 'Expert Electrical Services', rating: 4.6, price: '₹300-600', address: 'Rajajinagar, Bangalore' },
        { name: 'Home Wiring Specialists', rating: 4.1, price: '₹200-400', address: 'Malleshwaram, Bangalore' },
        { name: 'Circuit Masters', rating: 4.3, price: '₹280-550', address: 'Frazer Town, Bangalore' },
        { name: 'Voltage Solutions', rating: 4.2, price: '₹220-450', address: 'Seshadripuram, Bangalore' }
      ],
      doctor: [
        { name: 'Dr. Sharma Medical Clinic', rating: 4.7, price: '₹400-800', address: 'Residency Road, Bangalore' },
        { name: 'City Health Center', rating: 4.5, price: '₹350-700', address: 'St. Marks Road, Bangalore' },
        { name: 'Family Care Clinic', rating: 4.3, price: '₹300-600', address: 'Richmond Town, Bangalore' },
        { name: 'Wellness Medical Center', rating: 4.6, price: '₹450-900', address: 'Langford Road, Bangalore' },
        { name: 'Prime Health Clinic', rating: 4.4, price: '₹380-750', address: 'Cunningham Road, Bangalore' }
      ]
    };

    const templates = placesTemplates[serviceType] || placesTemplates['plumber'];
    
    return templates.map((template, index) => {
      // Generate realistic coordinates around user's location
      const latOffset = (Math.random() - 0.5) * 0.02; // Within ~2km
      const lngOffset = (Math.random() - 0.5) * 0.02;
      const distance = Math.round((Math.random() * 8 + 0.5) * 10) / 10; // 0.5 to 8.5 km
      
      return {
        id: template.id || `google_${serviceType}_${index + 1}`,
        name: template.name,
        rating: template.rating,
        distance: template.distance || `${distance} km`,
        price: template.price,
        verified: template.verified !== undefined ? template.verified : Math.random() > 0.3, // 70% verified
        phone: template.phone || `+91 ${9800000000 + Math.floor(Math.random() * 100000000)}`,
        experience: template.experience || `${Math.floor(Math.random() * 10) + 5} years`,
        lat: template.lat || lat + latOffset,
        lng: template.lng || lng + lngOffset,
        address: template.address,
        reviews: template.reviews || Math.floor(Math.random() * 200) + 50,
        isGooglePlace: template.isGooglePlace !== undefined ? template.isGooglePlace : true, // Flag to distinguish from our database providers
        placeId: `google_place_${index + 1}` // Mock place ID
      };
    });
  };

  // Interactive OpenStreetMap Component using React Leaflet
  const MapComponent = ({ providers = [], selectedService }) => {
    // Default center (Hyderabad, Telangana)
    const defaultCenter = [17.385044, 78.486671];
    const defaultZoom = 12;

    // Calculate center based on providers or use default
    const getMapCenter = () => {
      if (providers.length > 0) {
        const avgLat = providers.reduce((sum, p) => sum + (p.lat || defaultCenter[0]), 0) / providers.length;
        const avgLng = providers.reduce((sum, p) => sum + (p.lng || defaultCenter[1]), 0) / providers.length;
        return [avgLat, avgLng];
      }
      return defaultCenter;
    };

    const mapCenter = getMapCenter();

    // Custom marker icons
    const createCustomIcon = (color) => {
      return new L.Icon({
        iconUrl: `data:image/svg+xml;base64,${btoa(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
            <circle cx="12" cy="12" r="6" fill="white"/>
          </svg>
        `)}`,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24],
      });
    };

    const verifiedIcon = createCustomIcon('#10B981'); // Green
    const unverifiedIcon = createCustomIcon('#F59E0B'); // Yellow
    const googleIcon = createCustomIcon('#4285F4'); // Blue
    const userLocationIcon = createCustomIcon('#EF4444'); // Red

    return (
      <div style={{
        width: '100%',
        height: '400px',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '2px solid #10B981',
        boxShadow: '0 4px 20px rgba(16, 185, 129, 0.1)'
      }}>
        <MapContainer
          center={mapCenter}
          zoom={defaultZoom}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* User Location Marker */}
          <Marker position={defaultCenter} icon={userLocationIcon}>
            <Popup>
              <div className="text-center">
                <strong>📍 Your Location</strong><br/>
                <small>Current position</small>
              </div>
            </Popup>
          </Marker>

          {/* Provider Markers */}
          {providers.map((provider, index) => {
            const position = [provider.lat || defaultCenter[0], provider.lng || defaultCenter[1]];
            const isVerified = provider.verified || provider.isVerified;
            const isGooglePlace = provider.isGooglePlace;

            // Choose icon based on provider type
            let icon = unverifiedIcon;
            if (isGooglePlace) icon = googleIcon;
            else if (isVerified) icon = verifiedIcon;

            return (
              <Marker
                key={provider.id || index}
                position={position}
                icon={icon}
                eventHandlers={{
                  click: () => handleProviderClick(provider),
                }}
              >
                <Popup>
                  <div className="p-2 max-w-xs">
                    <h3 className="font-bold text-lg mb-2">{provider.name}</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center">
                        <span className="text-yellow-500 mr-1">⭐</span>
                        <span>{provider.rating} ({provider.reviews || 'N/A'} reviews)</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-green-600 mr-1">💰</span>
                        <span>{provider.price}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-blue-600 mr-1">📍</span>
                        <span>{provider.distance} away</span>
                      </div>
                      {provider.phone && (
                        <div className="flex items-center">
                          <span className="text-purple-600 mr-1">📞</span>
                          <span>{provider.phone}</span>
                        </div>
                      )}
                      {provider.experience && (
                        <div className="flex items-center">
                          <span className="text-indigo-600 mr-1">💼</span>
                          <span>{provider.experience} experience</span>
                        </div>
                      )}
                      {provider.address && (
                        <div className="flex items-start mt-2">
                          <span className="text-red-600 mr-1">🏠</span>
                          <span className="text-xs">{provider.address}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex gap-2">
                      {serviceDiscoveryMode === 'own-database' ? (
                        <button
                          onClick={() => handleProviderClick(provider)}
                          className="w-full py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg text-sm font-bold hover:scale-105 transition-transform"
                        >
                          Select Provider
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => window.open(`tel:${provider.phone}`, '_blank')}
                            className="flex-1 py-2 bg-green-500 text-white rounded-lg text-sm font-bold hover:scale-105 transition-transform"
                          >
                            📞 Call
                          </button>
                          <button
                            onClick={() => window.open(`https://maps.google.com/?q=${provider.lat},${provider.lng}`, '_blank')}
                            className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold hover:scale-105 transition-transform"
                          >
                            🗺️ Directions
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Map Info Overlay */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#374151',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(4px)'
        }}>
          <div><strong>Search Radius:</strong> 10km</div>
          <div><strong>Service:</strong> {selectedService || 'All Services'}</div>
          <div><strong>Providers Found:</strong> {providers.length}</div>
          <div><strong>Map:</strong> OpenStreetMap</div>
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

  const handleProviderRegistration = async (e) => {
    e.preventDefault();
    setProviderRegistrationLoading(true);

    try {
      // Get current location for the provider
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const providerData = {
        businessName: providerForm.businessName,
        serviceType: providerForm.serviceType,
        description: providerForm.description,
        phone: providerForm.phone,
        email: providerForm.email,
        address: providerForm.address,
        basePrice: parseInt(providerForm.basePrice),
        hourlyRate: providerForm.hourlyRate ? parseInt(providerForm.hourlyRate) : null,
        experience: providerForm.experience ? parseInt(providerForm.experience) : 0,
        videoConsultation: providerForm.videoConsultation,
        location: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        },
        userId: user?.id || userData.id // Link to current user
      };

      const response = await apiCall('/providers/register', {
        method: 'POST',
        body: JSON.stringify(providerData)
      });

      if (response.success !== false && response.provider) {
        // Reset form
        setProviderForm({
          businessName: '',
          serviceType: '',
          description: '',
          phone: '',
          email: '',
          address: '',
          basePrice: '',
          hourlyRate: '',
          experience: '',
          videoConsultation: false
        });

        setShowProviderRegistration(false);

        toast.success('Provider registration successful! Your profile is under review.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        throw new Error(response.msg || 'Failed to register provider');
      }
    } catch (error) {
      console.error('Error registering provider:', error);

      if (error.code === 1) { // Geolocation permission denied
        toast.error('Location access is required to register as a provider. Please enable location services.', {
          position: "top-right",
          autoClose: 5000,
        });
      } else {
        toast.error(error.message || 'Failed to register as provider. Please try again.', {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } finally {
      setProviderRegistrationLoading(false);
    }
  };

  const renderDashboard = () => (
    <div className="text-center mb-20">
      {/* Hero Title with Beautiful Gradient Text */}
      <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
        <span className="text-gray-900">Welcome </span>
        <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent font-black" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {userData.name}!
        </span>
      </h1>
      <p className="text-xl text-gray-800 font-semibold max-w-3xl mx-auto mb-10 leading-relaxed" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.05)' }}>
        Find and book trusted local services within 10 km. Video consults, live tracking, emergency mode, and rewards built in.
      </p>

  {/* Feature Cards with White Background */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20 m-3">
        <div className="group text-center bg-gradient-to-br from-orange-50 to-pink-50 p-8 rounded-2xl shadow-xl border-2 border-orange-400 hover:shadow-2xl hover:scale-105 hover:border-orange-600 hover:-translate-y-2 transition-all duration-300">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300 shadow-xl">
            <i className="fas fa-map-marker-alt text-white text-3xl drop-shadow-lg"></i>
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-3" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}> Location Search</h3>
          <p className="text-gray-900 text-base font-black leading-relaxed">Auto-detect location to find services within 10 km</p>
        </div>
         <div className="group text-center bg-gradient-to-br from-orange-50 to-pink-50 p-8 rounded-2xl shadow-xl border-2 border-orange-400 hover:shadow-2xl hover:scale-105 hover:border-orange-600 hover:-translate-y-2 transition-all duration-300">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300 shadow-xl">
            <i className="fas fa-calendar-check text-white text-3xl drop-shadow-lg"></i>
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-3" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}> Easy Booking</h3>
          <p className="text-gray-900 text-base font-black leading-relaxed">Time slots, emergency option, and confirmations</p>
        </div>
        <div className="group text-center bg-gradient-to-br from-orange-50 to-pink-50 p-8 rounded-2xl shadow-xl border-2 border-orange-400 hover:shadow-2xl hover:scale-105 hover:border-orange-600 hover:-translate-y-2 transition-all duration-300">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300 shadow-xl">
            <i className="fas fa-language text-white text-3xl drop-shadow-lg"></i>
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-3" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>Multi-language</h3>
          <p className="text-gray-900 text-base font-black leading-relaxed">Use the app in your local language</p>
        </div>
        <div className="group text-center bg-gradient-to-br from-orange-50 to-pink-50 p-8 rounded-2xl shadow-xl border-2 border-orange-400 hover:shadow-2xl hover:scale-105 hover:border-orange-600 hover:-translate-y-2 transition-all duration-300">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300 shadow-xl">
            <i className="fas fa-location-arrow text-white text-3xl drop-shadow-lg"></i>
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-3" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>Live Tracking</h3>
          <p className="text-gray-900 text-base font-black leading-relaxed">Track provider arrival in real-time</p>
        </div>
      </div>
    </div>
  );

  const renderServicesSection = () => (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-gray-900 mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
            Request <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Service</span>
          </h2>
          <p className="text-xl text-gray-800 font-bold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.05)' }}>Fill in the details to find the best helpers near you</p>
        </div>

        {/* Service Discovery Mode Toggle */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl p-6 border-2 border-orange-200">
            <h3 className="text-xl font-black text-gray-900 mb-4 text-center" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
              <i className="fas fa-search text-orange-500 mr-2"></i>
              Service Discovery Mode
            </h3>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setServiceDiscoveryMode('own-database')}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                  serviceDiscoveryMode === 'own-database'
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg border-2 border-orange-600'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-orange-400'
                }`}
              >
                <i className="fas fa-database mr-2"></i>
                Our Database
              </button>
              <button
                onClick={() => setServiceDiscoveryMode('google-places')}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                  serviceDiscoveryMode === 'google-places'
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg border-2 border-orange-600'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-orange-400'
                }`}
              >
                <i className="fas fa-map-marked-alt mr-2"></i>
                Google Places
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-3 text-center">
              {serviceDiscoveryMode === 'own-database'
                ? 'Find registered service providers from our verified database with booking options'
                : 'Discover nearby service providers from Google Places (information only)'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl border-2 border-orange-400 p-8">
          <form onSubmit={handleServiceFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Service Type</label>
                <select
                  name="serviceType"
                  value={serviceForm.serviceType}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-gray-900 font-medium"
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
                <label className="block text-sm font-bold text-gray-900 mb-2">Urgency Level</label>
                <select
                  name="urgency"
                  value={serviceForm.urgency}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-gray-900 font-medium"
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Problem Description</label>
              <textarea
                name="problemDescription"
                value={serviceForm.problemDescription}
                onChange={handleFormChange}
                required
                rows={4}
                placeholder="Please describe your problem in detail..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-gray-900"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Location</label>
                <div className="relative">
                  <input
                    type="text"
                    name="location"
                    value={serviceForm.location}
                    onChange={handleFormChange}
                    required
                    placeholder="Enter your address"
                    className="w-full px-4 py-3 pr-32 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={gettingLocation}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-semibold rounded-lg hover:shadow-md transition-all duration-300 disabled:opacity-50"
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
                <label className="block text-sm font-bold text-gray-900 mb-2">Budget Range</label>
                <select
                  name="budget"
                  value={serviceForm.budget}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-gray-900 font-medium"
                >
                  <option value="">Any Budget</option>
                  <option value="200-300">₹200 - ₹300</option>
                  <option value="300-500">₹300 - ₹500</option>
                  <option value="500-1000">₹500 - ₹1000</option>
                  <option value="1000+">₹1000+</option>
                </select>
              </div>
            </div>

            <div className="text-center pt-4">
              <button
                type="submit"
                className="px-10 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold text-lg"
              >
               Find Helpers Near Me
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );

  const renderMyAccount = () => (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-gray-900 mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
            My <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Account</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-orange-400 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <i className="fas fa-user text-orange-500 mr-3 text-2xl"></i>
              Profile Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-700">Full Name</label>
                <p className="text-lg text-gray-900 font-medium">{userData.name}</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700">Email</label>
                <p className="text-lg text-gray-900 font-medium">{userData.email}</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700">Phone</label>
                <p className="text-lg text-gray-900 font-medium">{userData.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700">Location</label>
                <p className="text-lg text-gray-900 font-medium">{userData.location}</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700">Member Since</label>
                <p className="text-lg text-gray-900 font-medium">{userData.joinDate}</p>
              </div>
            </div>
          </div>

          {/* Enhanced Rewards & Wallet Card */}
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-pink-400 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <i className="fas fa-wallet text-pink-500 mr-3 text-2xl"></i>
                  Rewards & Wallet
                </h3>
                <p className="text-sm text-gray-600 mt-1">Balance & Tier Progress</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Current Tier</div>
                <div className="font-bold text-lg text-pink-600">{userData.tier || 'Bronze'}</div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Coins Display */}
              <div className="text-center bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-baseline justify-center gap-3">
                  <span className="text-5xl font-bold">{userData.coinsEarned}</span>
                  <span className="text-xl font-semibold">coins</span>
                </div>
                <div className="text-lg font-semibold mt-2">RahaSeva Wallet</div>
              </div>

              {/* Tier Progress Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Progress to Silver</span>
                  <span className="text-sm text-gray-500">{Math.min(100, Math.round((userData.coinsEarned / 500) * 100))}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 bg-gradient-to-r from-amber-400 to-yellow-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.round((userData.coinsEarned / 500) * 100))}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1 text-center">
                  {500 - userData.coinsEarned > 0 ? `${500 - userData.coinsEarned} coins to Silver tier` : 'Silver tier achieved!'}
                </div>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center bg-orange-100 border-2 border-orange-400 rounded-xl p-4">
                  <div className="text-3xl font-bold text-orange-600">{userData.totalBookings}</div>
                  <div className="text-sm font-semibold text-gray-800">Total Bookings</div>
                </div>
                <div className="text-center bg-pink-100 border-2 border-pink-400 rounded-xl p-4">
                  <div className="text-3xl font-bold text-pink-600">{userData.completedBookings}</div>
                  <div className="text-sm font-semibold text-gray-800">Completed</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowRedeemModal(true)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg"
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}
                >
                  <i className="fas fa-gift mr-2"></i>
                  Redeem Points
                </button>
                <button 
                  onClick={() => {
                    // Navigate to wallet history or show history modal
                    toast.info('Wallet history feature coming soon!', { autoClose: 2000 });
                  }}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-all duration-300"
                >
                  <i className="fas fa-history text-gray-600"></i>
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
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <i className="fas fa-calendar-check mr-3 text-2xl"></i>
                Booking History
              </h3>
              <div className="text-white/90 text-sm">
                {bookingHistory.length} total bookings
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {bookingHistory.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-calendar-times text-6xl text-gray-400 mb-4"></i>
                <p className="text-xl text-gray-600 mb-2">No bookings yet</p>
                <p className="text-gray-500">Start by booking your first service!</p>
                <button 
                  onClick={() => setActiveSection('services')}
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-bold hover:scale-105 transition-all duration-300"
                >
                  Find Services
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {bookingHistory.map((booking) => (
                  <div key={booking.id} className="bg-gradient-to-r from-orange-50 to-pink-50 border-2 border-orange-200 rounded-2xl p-6 hover:shadow-xl hover:border-orange-400 hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-start justify-between">
                      {/* Left side - Service Info with Avatar */}
                      <div className="flex items-start gap-4 flex-1">
                        {/* Service Icon/Avatar */}
                        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <i className={`text-white text-2xl ${
                            booking.service === 'Plumber' ? 'fas fa-wrench' :
                            booking.service === 'Doctor' ? 'fas fa-user-md' :
                            booking.service === 'Electrician' ? 'fas fa-bolt' :
                            'fas fa-tools'
                          }`}></i>
                        </div>
                        
                        {/* Service Details */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h4 className="text-2xl font-bold text-gray-900">{booking.service}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm border-2 ${
                              booking.status === 'Completed' ? 'bg-green-100 text-green-800 border-green-300' :
                              booking.status === 'In Progress' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                              booking.status === 'Confirmed' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                              'bg-gray-100 text-gray-800 border-gray-300'
                            }`}>
                              {booking.status}
                            </span>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center text-gray-700">
                              <i className="fas fa-user-circle mr-3 text-orange-500 text-lg"></i>
                              <span className="font-semibold">{booking.provider}</span>
                            </div>
                            <div className="flex items-center text-gray-700">
                              <i className="fas fa-calendar-alt mr-3 text-pink-500 text-lg"></i>
                              <span>{new Date(booking.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}</span>
                            </div>
                            {booking.type && (
                              <div className="flex items-center text-gray-700">
                                <i className="fas fa-info-circle mr-3 text-blue-500 text-lg"></i>
                                <span className="text-sm font-medium">{booking.type}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right side - Price and Actions */}
                      <div className="text-right flex flex-col items-end gap-3">
                        <div className="text-3xl font-bold text-green-600 mb-2">{booking.amount}</div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2">
                          <button 
                            onClick={() => toast.info(`Viewing details for ${booking.service} booking`, { autoClose: 2000 })}
                            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm font-bold"
                          >
                            <i className="fas fa-eye mr-2"></i>
                            Details
                          </button>
                          
                          {booking.status === 'Completed' ? (
                            <button 
                              onClick={() => toast.success('Rating feature coming soon!', { autoClose: 2000 })}
                              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg hover:scale-105 transition-all duration-300 text-sm font-bold"
                            >
                              <i className="fas fa-star mr-2"></i>
                              Rate
                            </button>
                          ) : booking.status === 'In Progress' ? (
                            <button 
                              onClick={() => toast.info('Tracking feature coming soon!', { autoClose: 2000 })}
                              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg hover:scale-105 transition-all duration-300 text-sm font-bold"
                            >
                              <i className="fas fa-map-marker-alt mr-2"></i>
                              Track
                            </button>
                          ) : (
                            <button 
                              onClick={() => toast.warning('Cancel booking feature coming soon!', { autoClose: 2000 })}
                              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg hover:scale-105 transition-all duration-300 text-sm font-bold"
                            >
                              <i className="fas fa-times mr-2"></i>
                              Cancel
                            </button>
                          )}
                        </div>
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 relative">
      {/* Subtle Decorative Circles */}
      <div className="fixed top-10 right-10 w-64 h-64 bg-orange-200/30 rounded-full blur-3xl -z-10"></div>
      <div className="fixed bottom-10 left-10 w-64 h-64 bg-pink-200/30 rounded-full blur-3xl -z-10"></div>
      <div className="fixed top-1/2 left-1/2 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl -z-10"></div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Render content based on active section */}
        {activeSection === 'dashboard' && (
          <>
            {/* Welcome Hero Section */}
            <section className="py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {renderDashboard()}
              </div>
            </section>

            {/* Service Categories */}
            <section className="py-20 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-black text-gray-900 mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
                    Our <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Services</span>
                  </h2>
                  <p className="text-xl text-gray-800 max-w-3xl mx-auto font-bold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.05)' }}>
                    We connect you with verified professionals for all your needs
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Home Services */}
                  <div className="bg-white p-8 rounded-2xl border-2 border-orange-400 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:border-orange-600 hover:-translate-y-2">
                    <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl transform transition-transform duration-300 hover:rotate-6 hover:scale-110">
                      <i className="fas fa-home text-white text-3xl drop-shadow-lg"></i>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-4" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>Home Services</h3>
                    <p className="text-gray-800 font-bold mb-6 leading-relaxed text-base">
                      Professional plumbing, electrical, and carpentry services for all your home needs.
                    </p>
                    <button 
                      onClick={() => handleServiceSelect('plumber')}
                      className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 font-bold text-lg border-2 border-orange-600"
                      style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <i className="fas fa-search text-white text-xl"></i>
                         Find Helpers
                      </span>
                    </button>
                  </div>

                  {/* Healthcare */}
                  <div className="bg-white p-8 rounded-2xl border-2 border-orange-400 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:border-orange-600 hover:-translate-y-2">
                    <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl transform transition-transform duration-300 hover:rotate-6 hover:scale-110">
                      <i className="fas fa-user-md text-white text-3xl drop-shadow-lg"></i>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-4" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>Healthcare</h3>
                    <p className="text-gray-800 font-bold mb-6 leading-relaxed text-base">
                      Expert doctors, hospitals, and healthcare professionals for your wellbeing.
                    </p>
                    <button 
                      onClick={() => handleServiceSelect('doctor')}
                      className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 font-bold text-lg border-2 border-orange-600"
                      style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <i className="fas fa-search text-white text-xl"></i>
                         Find Helpers
                      </span>
                    </button>
                  </div>

                  {/* Emergency Services */}
                  <div className="bg-white p-8 rounded-2xl border-2 border-orange-400 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:border-orange-600 hover:-translate-y-2">
                    <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl transform transition-transform duration-300 hover:rotate-6 hover:scale-110">
                      <i className="fas fa-ambulance text-white text-3xl drop-shadow-lg"></i>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-4" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>Emergency</h3>
                    <p className="text-gray-800 font-bold mb-6 leading-relaxed text-base">
                      24/7 emergency services including ambulance and urgent repairs.
                    </p>
                    <button 
                      onClick={() => handleServiceSelect('emergency')}
                      className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 font-bold text-lg border-2 border-orange-600"
                      style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <i className="fas fa-search text-white text-xl"></i>
                         Find Helpers
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-black text-gray-900 mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
                    Why Choose <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>HelpHive?</span>
                  </h2>
                  <p className="text-xl text-gray-800 max-w-3xl mx-auto font-bold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.05)' }}>One-stop home services + healthcare with emergency mode, video + AR, and rewards.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="text-center bg-white p-8 rounded-2xl shadow-xl border-2 border-orange-400 hover:shadow-2xl hover:scale-105 hover:border-orange-600 hover:-translate-y-2 transition-all duration-300">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform transition-transform duration-300 hover:rotate-6 hover:scale-110">
                      <i className="fas fa-bolt text-white text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-3" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>Emergency Mode</h3>
                    <p className="text-gray-800 text-base font-bold leading-relaxed">Instant connect to nearest provider</p>
                  </div>

                  <div className="text-center bg-white p-8 rounded-2xl shadow-xl border-2 border-orange-400 hover:shadow-2xl hover:scale-105 hover:border-orange-600 hover:-translate-y-2 transition-all duration-300">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform transition-transform duration-300 hover:rotate-6 hover:scale-110">
                      <i className="fas fa-video text-white text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-3" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>Video + AR</h3>
                    <p className="text-gray-800 text-base font-bold leading-relaxed">Video consults with AR annotations</p>
                  </div>

                  <div className="text-center bg-white p-8 rounded-2xl shadow-xl border-2 border-orange-400 hover:shadow-2xl hover:scale-105 hover:border-orange-600 hover:-translate-y-2 transition-all duration-300">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform transition-transform duration-300 hover:rotate-6 hover:scale-110">
                      <i className="fas fa-certificate text-white text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-3" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>Verified Providers</h3>
                    <p className="text-gray-800 text-base font-bold leading-relaxed">KYC badges, ratings, trust & safety</p>
                  </div>

                  <div className="text-center bg-white p-8 rounded-2xl shadow-xl border-2 border-orange-400 hover:shadow-2xl hover:scale-105 hover:border-orange-600 hover:-translate-y-2 transition-all duration-300">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform transition-transform duration-300 hover:rotate-6 hover:scale-110">
                      <i className="fas fa-coins text-white text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-3" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>Wallet & Rewards</h3>
                    <p className="text-gray-800 text-base font-bold leading-relaxed">Earn and redeem points on bookings</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <section className="py-20 bg-gradient-to-br from-orange-50 to-pink-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-black text-gray-900 mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
                    Quick <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Actions</span>
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 ">
                  <button 
                    onClick={() => setActiveSection('services')}
                    className="p-10 bg-white border-2 border-orange-400 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 hover:border-orange-600 hover:-translate-y-2 transition-all duration-300"
                  >
                    <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform transition-transform duration-300 hover:rotate-6 hover:scale-110">
                      <i className="fas fa-search text-white text-3xl"></i>
                    </div>
                    <h4 className="text-2xl font-black text-gray-900 mb-3" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>Find Services</h4>
                    <p className="text-gray-800 text-base font-bold leading-relaxed">Browse nearby providers</p>
                  </button>
                  
                  <button 
                    onClick={() => setActiveSection('bookings')}
                    className="p-10 bg-white border-2 border-orange-400 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 hover:border-orange-600 hover:-translate-y-2 transition-all duration-300"
                  >
                    <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform transition-transform duration-300 hover:rotate-6 hover:scale-110">
                      <i className="fas fa-calendar text-white text-3xl"></i>
                    </div>
                    <h4 className="text-2xl font-black text-gray-900 mb-3" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>My Bookings</h4>
                    <p className="text-gray-800 text-base font-bold leading-relaxed">View and manage appointments</p>
                  </button>
                  
                  <button 
                    onClick={() => setActiveSection('account')}
                    className="p-10 bg-white border-2 border-orange-400 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 hover:border-orange-600 hover:-translate-y-2 transition-all duration-300"
                  >
                    <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform transition-transform duration-300 hover:rotate-6 hover:scale-110">
                      <i className="fas fa-wallet text-white text-3xl"></i>
                    </div>
                    <h4 className="text-2xl font-black text-gray-900 mb-3" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>RahaSeva Wallet</h4>
                    <p className="text-gray-800 text-base font-bold leading-relaxed">Check balance and rewards</p>
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
          <section className="py-20 bg-gradient-to-br from-orange-50 to-pink-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-black text-gray-900 mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
                  Available <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{selectedService}s</span> Near You
                </h2>
                <p className="text-xl text-gray-800 font-bold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.05)' }}>Within 10km radius from your location</p>
              </div>

              {/* Interactive Polymaps Integration */}
              <div className="bg-white rounded-2xl p-8 mb-8 border-2 border-orange-400 shadow-2xl">
                <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-6 mb-6 border-2 border-pink-300">
                  <h3 className="text-2xl font-black text-gray-900 mb-4 flex items-center" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
                    <i className="fas fa-map-marker-alt text-orange-500 mr-3 text-2xl"></i>
                    Live Map View - 10km Radius
                  </h3>
                  <div className="h-96 rounded-xl border-2 border-orange-400 relative overflow-hidden shadow-lg">
                    {mapInitialized ? (
                      <MapComponent 
                        providers={serviceProviders[selectedService] || []} 
                        selectedService={selectedService}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                          <p className="text-xl text-gray-800 mb-2">Loading Interactive Map...</p>
                          <p className="text-gray-500">Custom Map Implementation</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex justify-center flex-wrap gap-4">
                    <div className="flex items-center bg-white px-4 py-2 rounded-xl border-2 border-green-400 shadow-md">
                      <div className="w-4 h-4 bg-green-500 rounded-full mr-2 shadow-sm"></div>
                      <span className="text-sm text-gray-900 font-bold">Verified Providers</span>
                    </div>
                    <div className="flex items-center bg-white px-4 py-2 rounded-xl border-2 border-yellow-400 shadow-md">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2 shadow-sm"></div>
                      <span className="text-sm text-gray-900 font-bold">Unverified</span>
                    </div>
                    {serviceDiscoveryMode === 'google-places' && (
                      <div className="flex items-center bg-white px-4 py-2 rounded-xl border-2 border-blue-400 shadow-md">
                        <div className="w-4 h-4 bg-blue-500 rounded-full mr-2 shadow-sm"></div>
                        <span className="text-sm text-gray-900 font-bold">Google Places</span>
                      </div>
                    )}
                    <div className="flex items-center bg-white px-4 py-2 rounded-xl border-2 border-red-400 shadow-md">
                      <div className="w-4 h-4 bg-red-500 rounded-full mr-2 shadow-sm"></div>
                      <span className="text-sm text-gray-900 font-bold">Your Location</span>
                    </div>
                  </div>
                </div>

                {/* Service Providers List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {serviceProviders[selectedService]?.map((provider) => (
                    <div key={provider.id} className="bg-white rounded-2xl p-6 shadow-xl border-2 border-orange-300 hover:shadow-2xl hover:scale-105 hover:border-orange-500 hover:-translate-y-2 transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-xl font-black text-gray-900 mb-2" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>{provider.name}</h4>
                          <div className="flex items-center mb-2">
                            <div className="flex text-yellow-400 mr-2 text-lg">
                              ⭐⭐⭐⭐⭐
                            </div>
                            <span className="text-gray-800 text-sm font-bold">{provider.rating} ({provider.reviews || Math.floor(Math.random() * 100) + 50} reviews)</span>
                          </div>
                          <div className="flex items-center text-gray-800 font-bold text-sm mb-2">
                            <i className="fas fa-map-marker-alt mr-2 text-orange-500 text-base"></i>
                            {provider.distance} away
                          </div>
                          <div className="flex items-center text-gray-800 font-bold text-sm mb-2">
                            <i className="fas fa-rupee-sign mr-2 text-green-500 text-base"></i>
                            {provider.price}
                          </div>
                          <div className="flex items-center text-gray-800 font-bold text-sm mb-2">
                            <i className="fas fa-phone mr-2 text-blue-500 text-base"></i>
                            {provider.phone || 'Not provided'}
                          </div>
                          <div className="flex items-center text-gray-800 font-bold text-sm mb-2">
                            <i className="fas fa-briefcase mr-2 text-purple-500 text-base"></i>
                            {provider.experience || 'Experience not specified'}
                          </div>
                          <div className="flex items-start text-gray-700 text-xs mb-2">
                            <i className="fas fa-map-pin mr-2 text-red-500 mt-1"></i>
                            <span className="leading-tight">{provider.address || 'Address not available'}</span>
                          </div>
                        </div>
                        {provider.verified && (
                          <div className="flex flex-col items-center ml-4">
                            <i className="fas fa-certificate text-green-500 text-2xl mb-1 drop-shadow-md"></i>
                            <span className="text-xs text-green-600 font-black">Verified</span>
                          </div>
                        )}
                        {provider.isGooglePlace && (
                          <div className="flex flex-col items-center ml-4">
                            <i className="fab fa-google text-blue-500 text-2xl mb-1 drop-shadow-md"></i>
                            <span className="text-xs text-blue-600 font-black">Google</span>
                          </div>
                        )}
                      </div>
                      
                      {serviceDiscoveryMode === 'own-database' ? (
                        <button 
                          onClick={() => handleProviderSelect(provider)}
                          className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-2xl hover:scale-110 transition-all duration-300 font-bold text-base"
                          style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}
                        >
                          📞 Select Provider
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <button 
                            onClick={() => window.open(`tel:${provider.phone}`, '_blank')}
                            className="w-full py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-bold text-sm"
                          >
                            📞 Call Now
                          </button>
                          <button 
                            onClick={() => window.open(`https://maps.google.com/?q=${provider.lat},${provider.lng}`, '_blank')}
                            className="w-full py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-bold text-sm"
                          >
                            🗺️ Get Directions
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Booking Options Popup */}
        {showBookingPopup && selectedProvider && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border-2 border-orange-400 animate-fade-in">
              <div className="text-center mb-6">
                <h3 className="text-3xl font-black text-gray-900 mb-3" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
                  📅 Book Service
                </h3>
                <p className="text-gray-800 font-bold text-base">Choose how you want to connect with <span className="text-orange-600">{selectedProvider.name}</span></p>
              </div>
              
              <div className="space-y-4">
                <button 
                  onClick={() => handleBookService('In-Person Visit')}
                  className="w-full p-5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center border-2 border-orange-600"
                >
                  <i className="fas fa-home mr-4 text-2xl"></i>
                  <div className="text-left">
                    <div className="font-black text-lg" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>🏠 Book In-Person Visit</div>
                    <div className="text-sm font-semibold opacity-95">Provider comes to your location</div>
                  </div>
                </button>
                
                <button 
                  onClick={() => handleBookService('Video Consultation')}
                  className="w-full p-5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center border-2 border-blue-600"
                >
                  <i className="fas fa-video mr-4 text-2xl"></i>
                  <div className="text-left">
                    <div className="font-black text-lg" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>📹 Video Consultation</div>
                    <div className="text-sm font-semibold opacity-95">Get help via video call + AR guidance</div>
                  </div>
                </button>
                
                <button 
                  onClick={() => handleBookService('Emergency Call')}
                  className="w-full p-5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center border-2 border-red-700"
                >
                  <i className="fas fa-phone mr-4 text-2xl"></i>
                  <div className="text-left">
                    <div className="font-black text-lg" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>☎️ Emergency Call</div>
                    <div className="text-sm font-semibold opacity-95">Immediate phone consultation</div>
                  </div>
                </button>
              </div>
              
              <button 
                onClick={() => setShowBookingPopup(false)}
                className="w-full mt-6 py-3 border-2 border-orange-400 bg-white text-gray-900 rounded-xl hover:bg-orange-50 hover:border-orange-600 hover:scale-105 transition-all duration-300 font-black text-base shadow-md"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        )}

        {/* Redeem Points Modal */}
        {showRedeemModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border-2 border-orange-400 animate-fade-in">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <i className="fas fa-gift text-white text-3xl"></i>
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-2" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
                  Redeem Points
                </h3>
                <p className="text-gray-600 font-semibold">Convert your coins to rewards</p>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-4 mb-6 border-2 border-orange-200">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Available Balance</div>
                  <div className="text-3xl font-bold text-orange-600">{userData.coinsEarned} coins</div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Amount to Redeem
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={redeemAmount}
                      onChange={(e) => setRedeemAmount(Math.max(0, Math.min(userData.coinsEarned, parseInt(e.target.value) || 0)))}
                      max={userData.coinsEarned}
                      min="10"
                      step="10"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-lg font-bold text-center"
                      placeholder="Enter amount"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                      coins
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Minimum: 10 coins • Maximum: {userData.coinsEarned} coins
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {[50, 100, 250].filter(amount => amount <= userData.coinsEarned).map(amount => (
                    <button
                      key={amount}
                      onClick={() => setRedeemAmount(amount)}
                      className="px-3 py-2 bg-gray-100 hover:bg-orange-100 border border-gray-300 hover:border-orange-400 rounded-lg text-sm font-bold transition-all duration-300"
                    >
                      {amount}
                    </button>
                  ))}
                </div>

                {redeemAmount > 0 && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3">
                    <div className="text-sm text-green-800">
                      <i className="fas fa-check-circle mr-2"></i>
                      You'll receive: <span className="font-bold">₹{Math.floor(redeemAmount / 10)}</span> credit
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      Exchange rate: 10 coins = ₹1
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setShowRedeemModal(false);
                    setRedeemAmount(0);
                  }}
                  className="flex-1 py-3 border-2 border-gray-300 bg-white text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-bold"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (redeemAmount >= 10 && redeemAmount <= userData.coinsEarned) {
                      // Update local state
                      setUserData(prev => ({
                        ...prev,
                        coinsEarned: prev.coinsEarned - redeemAmount
                      }));
                      
                      const creditAmount = Math.floor(redeemAmount / 10);
                      toast.success(`Successfully redeemed ${redeemAmount} coins for ₹${creditAmount} credit!`, {
                        position: "top-right",
                        autoClose: 4000,
                      });
                      
                      setShowRedeemModal(false);
                      setRedeemAmount(0);
                    } else {
                      toast.error('Please enter a valid amount (minimum 10 coins)', {
                        position: "top-right",
                        autoClose: 3000,
                      });
                    }
                  }}
                  disabled={redeemAmount < 10 || redeemAmount > userData.coinsEarned}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}
                >
                  <i className="fas fa-gift mr-2"></i>
                  Redeem Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Provider Registration Modal */}
      {showProviderRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black text-gray-900" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
                  Register as Service Provider
                </h2>
                <button 
                  onClick={() => setShowProviderRegistration(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <form onSubmit={handleProviderRegistration} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Business Name</label>
                    <input
                      type="text"
                      value={providerForm.businessName}
                      onChange={(e) => setProviderForm({...providerForm, businessName: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                      placeholder="Your business name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Service Type</label>
                    <select
                      value={providerForm.serviceType}
                      onChange={(e) => setProviderForm({...providerForm, serviceType: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                      required
                    >
                      <option value="">Select service type</option>
                      <option value="plumber">Plumber</option>
                      <option value="electrician">Electrician</option>
                      <option value="carpenter">Carpenter</option>
                      <option value="painter">Painter</option>
                      <option value="mechanic">Mechanic</option>
                      <option value="cleaner">Cleaner</option>
                      <option value="gardener">Gardener</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={providerForm.description}
                    onChange={(e) => setProviderForm({...providerForm, description: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-colors h-24 resize-none"
                    placeholder="Describe your services..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={providerForm.phone}
                      onChange={(e) => setProviderForm({...providerForm, phone: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                      placeholder="+91 XXXXX XXXXX"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={providerForm.email}
                      onChange={(e) => setProviderForm({...providerForm, email: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
                  <textarea
                    value={providerForm.address}
                    onChange={(e) => setProviderForm({...providerForm, address: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-colors h-20 resize-none"
                    placeholder="Full address of your business"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Base Price (₹)</label>
                    <input
                      type="number"
                      value={providerForm.basePrice}
                      onChange={(e) => setProviderForm({...providerForm, basePrice: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                      placeholder="100"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Hourly Rate (₹)</label>
                    <input
                      type="number"
                      value={providerForm.hourlyRate}
                      onChange={(e) => setProviderForm({...providerForm, hourlyRate: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                      placeholder="50"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Experience (Years)</label>
                    <input
                      type="number"
                      value={providerForm.experience}
                      onChange={(e) => setProviderForm({...providerForm, experience: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                      placeholder="5"
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="videoConsultation"
                    checked={providerForm.videoConsultation}
                    onChange={(e) => setProviderForm({...providerForm, videoConsultation: e.target.checked})}
                    className="w-5 h-5 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="videoConsultation" className="text-sm font-bold text-gray-700">
                    Offer video consultation services
                  </label>
                </div>

                <div className="flex space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowProviderRegistration(false)}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={providerRegistrationLoading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50"
                  >
                    {providerRegistrationLoading ? 'Registering...' : 'Register Now'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
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
