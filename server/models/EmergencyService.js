import mongoose from 'mongoose';

/**
 * EmergencyService Model - Handles emergency service requests
 * This supports the Emergency Mode (Quick Help) feature mentioned in the project requirements
 */
const EmergencyServiceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  serviceType: {
    type: String,
    required: true,
    enum: ['plumber', 'electrician', 'doctor', 'ambulance', 'fire', 'police', 'other'],
    index: true
  },
  status: {
    type: String,
    enum: ['requested', 'searching', 'assigned', 'in-progress', 'completed', 'cancelled'],
    default: 'requested',
    index: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    }
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider'
  },
  assignedAt: {
    type: Date
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  estimatedArrival: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'high',
    index: true
  },
  tracking: [{
    status: String,
    location: {
      coordinates: [Number] // [longitude, latitude]
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  payment: {
    required: {
      type: Boolean,
      default: true
    },
    amount: {
      type: Number
    },
    method: {
      type: String,
      enum: ['cash', 'wallet', 'card', 'upi', 'insurance', 'free'],
      default: 'cash'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'waived'],
      default: 'pending'
    }
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    providedAt: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create geospatial index for location-based queries
EmergencyServiceSchema.index({ "location.coordinates": "2dsphere" });

// Virtual for emergency service status display
EmergencyServiceSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'requested': 'Help Requested',
    'searching': 'Searching for Provider',
    'assigned': 'Provider Assigned',
    'in-progress': 'Help is On the Way',
    'completed': 'Service Completed',
    'cancelled': 'Request Cancelled'
  };
  
  return statusMap[this.status] || this.status;
});

// Generate emergency tracking link
EmergencyServiceSchema.virtual('trackingLink').get(function() {
  return `/emergency/track/${this._id}`;
});

// Add location tracking update
EmergencyServiceSchema.methods.updateTracking = async function(status, coordinates, notes = '') {
  this.tracking.push({
    status,
    location: {
      coordinates
    },
    timestamp: new Date(),
    notes
  });
  
  if (status === 'assigned') {
    this.status = 'assigned';
    this.assignedAt = new Date();
    
    // Calculate ETA (estimated time of arrival) - simplified version
    this.estimatedArrival = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
  } else if (status === 'started') {
    this.status = 'in-progress';
    this.startedAt = new Date();
  } else if (status === 'arrived' || status === 'completed') {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  
  return this.save();
};

// Convert emergency request to regular booking
EmergencyServiceSchema.methods.convertToBooking = async function(BookingModel) {
  // This method would create a regular booking from the emergency service
  if (!this.provider) {
    throw new Error('Cannot convert to booking without assigned provider');
  }
  
  const bookingData = {
    user: this.user,
    provider: this.provider,
    serviceDetails: {
      serviceType: this.serviceType,
      problemDescription: this.description,
      urgency: 'emergency',
      estimatedDuration: 1 // Default to 1 hour
    },
    bookingType: 'Emergency Call',
    location: this.location,
    schedule: {
      requestedDate: this.createdAt,
      requestedTime: new Date(this.createdAt).toTimeString().substring(0, 5),
      confirmedDate: this.assignedAt,
      confirmedTime: new Date(this.assignedAt).toTimeString().substring(0, 5),
      completedAt: this.completedAt
    },
    pricing: {
      baseAmount: this.payment.amount || 0,
      totalAmount: this.payment.amount || 0,
      currency: 'INR'
    },
    payment: {
      method: this.payment.method,
      status: this.payment.status === 'completed' ? 'paid' : 'pending'
    },
    status: this.status === 'completed' ? 'completed' : 'in-progress'
  };
  
  // Create the booking
  const booking = new BookingModel(bookingData);
  await booking.save();
  
  // Update this emergency service with the booking ID
  this.bookingId = booking._id;
  await this.save();
  
  return booking;
};

const EmergencyService = mongoose.model('EmergencyService', EmergencyServiceSchema);

export default EmergencyService;
