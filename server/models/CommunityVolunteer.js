import mongoose from 'mongoose';

/**
 * CommunityVolunteer Model - Handles community volunteer services
 * This supports the Community Help Mode feature mentioned in the project requirements
 */
const CommunityVolunteerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  skills: [{
    type: String,
    enum: ['plumber', 'electrician', 'carpenter', 'doctor', 'emergency', 'cleaning', 'painting', 'mechanic', 'tutor', 'gardener', 'other']
  }],
  organization: {
    type: String
  },
  isNGO: {
    type: Boolean,
    default: false
  },
  contact: {
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    whatsapp: String
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
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'on-call'],
      default: 'on-call'
    }
  },
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
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
    },
    serviceRadius: {
      type: Number, // in km
      default: 10,
      min: 1,
      max: 50
    }
  },
  verification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    idProofType: {
      type: String,
      enum: ['aadhar', 'pan', 'voter', 'passport', 'driving', 'other']
    },
    idProofVerified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date
  },
  bio: {
    type: String,
    maxlength: 1000
  },
  experience: {
    type: Number, // in years
    min: 0
  },
  profilePicture: String,
  servicesOffered: [{
    service: {
      type: String,
      required: true
    },
    description: String,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  stats: {
    totalHelpRequests: {
      type: Number,
      default: 0
    },
    completedRequests: {
      type: Number,
      default: 0
    },
    peopleHelped: {
      type: Number,
      default: 0
    },
    hoursDonated: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create geospatial index for location-based queries
CommunityVolunteerSchema.index({ "location.coordinates": "2dsphere" });
CommunityVolunteerSchema.index({ skills: 1 });
CommunityVolunteerSchema.index({ "verification.isVerified": 1, isActive: 1 });

// Virtual for formatted experience
CommunityVolunteerSchema.virtual('formattedExperience').get(function() {
  if (!this.experience) return 'Not specified';
  return `${this.experience} year${this.experience !== 1 ? 's' : ''}`;
});

// Virtual for rating display
CommunityVolunteerSchema.virtual('ratingDisplay').get(function() {
  return `${this.stats.rating.toFixed(1)} (${this.stats.totalReviews} reviews)`;
});

// Virtual for completion rate
CommunityVolunteerSchema.virtual('completionRate').get(function() {
  if (this.stats.totalHelpRequests === 0) return 0;
  return Math.round((this.stats.completedRequests / this.stats.totalHelpRequests) * 100);
});

const CommunityVolunteer = mongoose.model('CommunityVolunteer', CommunityVolunteerSchema);

export default CommunityVolunteer;
