import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: true,
  },
  serviceDetails: {
    serviceType: {
      type: String,
      required: true,
      enum: ['plumber', 'electrician', 'carpenter', 'doctor', 'emergency', 'other'],
    },
    problemDescription: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    urgency: {
      type: String,
      enum: ['normal', 'urgent', 'emergency'],
      default: 'normal',
    },
    estimatedDuration: {
      type: Number, // in hours
      default: 1,
    },
  },
  bookingType: {
    type: String,
    required: true,
    enum: ['In-Person Visit', 'Video Consultation', 'Emergency Call'],
  },
  location: {
    address: {
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
  schedule: {
    requestedDate: {
      type: Date,
      required: true,
    },
    requestedTime: {
      type: String,
      required: true,
    },
    confirmedDate: {
      type: Date,
    },
    confirmedTime: {
      type: String,
    },
    completedAt: {
      type: Date,
    },
  },
  pricing: {
    baseAmount: {
      type: Number,
      required: true,
    },
    additionalCharges: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
  },
  payment: {
    method: {
      type: String,
      enum: ['cash', 'upi', 'card', 'wallet', 'coins'],
      default: 'cash',
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'failed'],
      default: 'pending',
    },
    transactionId: {
      type: String,
    },
    paidAt: {
      type: Date,
    },
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'refunded'],
    default: 'pending',
  },
  communication: {
    providerPhone: {
      type: String,
    },
    userPhone: {
      type: String,
    },
    meetingLink: {
      type: String, // For video consultations
    },
    notes: {
      type: String,
      maxlength: 500,
    },
  },
  feedback: {
    userRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    userReview: {
      type: String,
      maxlength: 500,
    },
    providerRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    providerReview: {
      type: String,
      maxlength: 500,
    },
  },
  cancellation: {
    cancelledBy: {
      type: String,
      enum: ['user', 'provider', 'admin'],
    },
    reason: {
      type: String,
    },
    cancelledAt: {
      type: Date,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
BookingSchema.index({ user: 1, createdAt: -1 });
BookingSchema.index({ provider: 1, createdAt: -1 });
BookingSchema.index({ status: 1, createdAt: -1 });
BookingSchema.index({ bookingId: 1 });
BookingSchema.index({ 'schedule.requestedDate': 1 });

// Pre-save middleware to generate booking ID
BookingSchema.pre('save', async function(next) {
  if (!this.bookingId) {
    const count = await mongoose.models.Booking.countDocuments();
    this.bookingId = `RS${Date.now()}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Virtual for formatted booking date
BookingSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toISOString().split('T')[0];
});

// Virtual for status display
BookingSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'pending': 'Pending Confirmation',
    'confirmed': 'Confirmed',
    'in-progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'refunded': 'Refunded'
  };
  return statusMap[this.status] || this.status;
});

const Booking = mongoose.model('Booking', BookingSchema);

export default Booking;