import mongoose from 'mongoose';

/**
 * CommunityHelpRequest Model - Handles requests for community volunteer help
 * This supports the Community Help Mode feature mentioned in the project requirements
 */
const CommunityHelpRequestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    unique: true,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  volunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityVolunteer'
  },
  helpType: {
    type: String,
    required: true,
    enum: ['plumber', 'electrician', 'carpenter', 'doctor', 'emergency', 'cleaning', 'painting', 'mechanic', 'tutor', 'gardener', 'other'],
    index: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
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
  status: {
    type: String,
    enum: ['pending', 'searching', 'accepted', 'in-progress', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },
  schedule: {
    requestedDate: {
      type: Date,
      required: true
    },
    requestedTime: {
      type: String,
      required: true
    },
    confirmedDate: Date,
    confirmedTime: String,
    completedAt: Date
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  isOnSite: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true, // Public requests can be seen by all volunteers
    index: true
  },
  communication: {
    contactPhone: String,
    contactEmail: String,
    notes: String
  },
  tracking: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String,
    updatedBy: {
      type: String,
      enum: ['user', 'volunteer', 'admin']
    }
  }],
  feedback: {
    userRating: {
      type: Number,
      min: 1,
      max: 5
    },
    userReview: String,
    volunteerRating: {
      type: Number,
      min: 1,
      max: 5
    },
    volunteerReview: String,
    reviewDate: Date
  },
  helpDetails: {
    hoursSpent: Number,
    materialsProvided: String,
    additionalPeopleHelped: Number
  },
  source: {
    type: String,
    enum: ['app', 'sms', 'call', 'partner', 'other'],
    default: 'app'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes for better performance
CommunityHelpRequestSchema.index({ "location.coordinates": "2dsphere" });
CommunityHelpRequestSchema.index({ helpType: 1, status: 1 });
CommunityHelpRequestSchema.index({ "schedule.requestedDate": 1 });

// Pre-save middleware to generate request ID
CommunityHelpRequestSchema.pre('save', async function(next) {
  if (!this.requestId) {
    const count = await mongoose.models.CommunityHelpRequest.countDocuments();
    this.requestId = `CH${Date.now()}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Virtual for formatted date
CommunityHelpRequestSchema.virtual('formattedDate').get(function() {
  return this.schedule.requestedDate.toISOString().split('T')[0];
});

// Virtual for status display
CommunityHelpRequestSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'pending': 'Request Pending',
    'searching': 'Looking for Volunteers',
    'accepted': 'Volunteer Assigned',
    'in-progress': 'Help in Progress',
    'completed': 'Help Completed',
    'cancelled': 'Request Cancelled'
  };
  
  return statusMap[this.status] || this.status;
});

// Virtual for urgency display
CommunityHelpRequestSchema.virtual('urgencyDisplay').get(function() {
  const urgencyMap = {
    'low': 'Low Priority',
    'medium': 'Normal Priority',
    'high': 'High Priority',
    'critical': 'Critical - Urgent Help Needed'
  };
  
  return urgencyMap[this.urgency] || this.urgency;
});

const CommunityHelpRequest = mongoose.model('CommunityHelpRequest', CommunityHelpRequestSchema);

export default CommunityHelpRequest;
