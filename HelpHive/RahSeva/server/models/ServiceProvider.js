import mongoose from 'mongoose';

const ServiceProviderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  businessName: {
    type: String,
    required: true,
    trim: true,
  },
  serviceType: {
    type: String,
    required: true,
    enum: ['plumber', 'electrician', 'carpenter', 'doctor', 'emergency', 'other'],
  },
  description: {
    type: String,
    required: true,
    maxlength: 500,
  },
  pricing: {
    basePrice: {
      type: Number,
      required: true,
      min: 100,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    unit: {
      type: String,
      enum: ['hour', 'consultation', 'service', 'emergency'],
      default: 'hour',
    },
  },
  location: {
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
  },
  availability: {
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    }],
    hours: {
      start: {
        type: String,
        default: '09:00',
      },
      end: {
        type: String,
        default: '18:00',
      },
    },
    emergency24x7: {
      type: Boolean,
      default: false,
    },
  },
  rating: {
    average: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  verification: {
    isVerified: {
      type: Boolean,
      default: false,
    },
    kycCompleted: {
      type: Boolean,
      default: false,
    },
    documentsUploaded: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
    },
  },
  experience: {
    years: {
      type: Number,
      required: true,
      min: 0,
    },
    specializations: [{
      type: String,
    }],
    certifications: [{
      name: String,
      issuedBy: String,
      issuedDate: Date,
    }],
  },
  contact: {
    phone: {
      type: String,
      required: true,
    },
    whatsapp: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
  },
  stats: {
    totalBookings: {
      type: Number,
      default: 0,
    },
    completedBookings: {
      type: Number,
      default: 0,
    },
    cancelledBookings: {
      type: Number,
      default: 0,
    },
    responseTime: {
      type: Number, // in minutes
      default: 30,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  profilePicture: {
    type: String,
    default: '',
  },
  gallery: [{
    type: String, // URLs to images
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create geospatial index for location-based queries
ServiceProviderSchema.index({ "location.coordinates": "2dsphere" });
ServiceProviderSchema.index({ serviceType: 1, "verification.isVerified": 1 });
ServiceProviderSchema.index({ "rating.average": -1 });

// Virtual for formatted distance (to be used with aggregation)
ServiceProviderSchema.virtual('formattedRating').get(function() {
  return `${this.rating.average} (${this.rating.totalReviews} reviews)`;
});

// Virtual for price display
ServiceProviderSchema.virtual('priceDisplay').get(function() {
  return `₹${this.pricing.basePrice}/${this.pricing.unit}`;
});

// Virtual for completion rate
ServiceProviderSchema.virtual('completionRate').get(function() {
  if (this.stats.totalBookings === 0) return 0;
  return Math.round((this.stats.completedBookings / this.stats.totalBookings) * 100);
});

const ServiceProvider = mongoose.model('ServiceProvider', ServiceProviderSchema);

export default ServiceProvider;