import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Password must be at least 6 characters long'],
    validate: {
      validator: function(password) {
        // Allow any password during save (since it's already hashed)
        return true;
      }
    }
  },
  phone: {
    type: String,
    required: false,
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'helper', 'admin'],
    default: 'user',
  },
  // Location information - simplified for better compatibility
  address: {
    type: String,
    required: function() { return this.role === 'helper'; }, // Only required for helpers
    default: ''
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [78.486671, 17.385044] // Default to Hyderabad
    }
  },
  // Helper-specific fields
  service: {
    type: String,
    required: function() { return this.role === 'helper'; },
    enum: ['plumber', 'electrician', 'carpenter', 'doctor', 'emergency', 'cleaning', 'painting', 'mechanic', 'tutor', 'gardener', 'other'],
    lowercase: true,
    trim: true
  },
  experience: {
    type: Number,
    required: function() { return this.role === 'helper'; },
    min: 0,
    max: 50,
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 1,
    max: 5,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  pricePerHour: {
    type: Number,
    required: function() { return this.role === 'helper'; },
    min: 100,
    max: 2000,
  },
  // User-specific fields
  coinsEarned: {
    type: Number,
    default: 250, // Welcome bonus
    min: 0,
  },
  totalBookings: {
    type: Number,
    default: 0,
    min: 0,
  },
  completedBookings: {
    type: Number,
    default: 0,
    min: 0,
  },
  // Profile information
  profilePicture: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create geospatial index for location queries
UserSchema.index({ "coordinates": "2dsphere" });

// Virtual for user's full profile
UserSchema.virtual('profile').get(function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    location: this.address || 'Not specified',
    joinDate: this.createdAt.toISOString().split('T')[0],
    coinsEarned: this.coinsEarned,
    totalBookings: this.totalBookings,
    completedBookings: this.completedBookings,
    role: this.role
  };
});

// Virtual for helper profile
UserSchema.virtual('helperProfile').get(function() {
  if (this.role !== 'helper') return null;
  return {
    id: this._id,
    name: this.name,
    service: this.service,
    rating: this.rating,
    experience: this.experience,
    pricePerHour: this.pricePerHour,
    location: {
      address: this.address,
      coordinates: this.coordinates
    },
    isVerified: this.isVerified,
    phone: this.phone
  };
});

const User = mongoose.model('User', UserSchema);

export default User;
