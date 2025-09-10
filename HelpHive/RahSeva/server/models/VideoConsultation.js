import mongoose from 'mongoose';

/**
 * VideoConsultation Model - Handles video consultation sessions
 * This supports the Video Call Support feature mentioned in the project requirements
 */
const VideoConsultationSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'ready', 'in-progress', 'completed', 'missed', 'cancelled'],
    default: 'scheduled',
    index: true
  },
  scheduledStartTime: {
    type: Date,
    required: true
  },
  scheduledEndTime: {
    type: Date,
    required: true
  },
  actualStartTime: {
    type: Date
  },
  actualEndTime: {
    type: Date
  },
  duration: {
    type: Number, // in minutes
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  sessionToken: {
    userToken: String,
    providerToken: String
  },
  meetingUrl: {
    type: String
  },
  features: {
    arEnabled: {
      type: Boolean,
      default: false
    },
    recording: {
      type: Boolean,
      default: false
    },
    screenSharing: {
      type: Boolean,
      default: true
    },
    chat: {
      type: Boolean,
      default: true
    }
  },
  problemDescription: {
    type: String,
    maxlength: 1000
  },
  diagnosis: {
    type: String,
    maxlength: 2000
  },
  recommendations: {
    type: String,
    maxlength: 2000
  },
  artifacts: [{
    type: {
      type: String,
      enum: ['image', 'document', 'recording', 'ar_annotation']
    },
    url: String,
    name: String,
    mimeType: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: String,
      enum: ['user', 'provider']
    }
  }],
  feedback: {
    userRating: {
      type: Number,
      min: 1,
      max: 5
    },
    userComments: String,
    providerRating: {
      type: Number,
      min: 1,
      max: 5
    },
    providerComments: String,
    qualityScore: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  followUp: {
    required: {
      type: Boolean,
      default: false
    },
    scheduledFor: Date,
    notes: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
VideoConsultationSchema.index({ booking: 1 }, { unique: true });
VideoConsultationSchema.index({ user: 1, status: 1 });
VideoConsultationSchema.index({ provider: 1, status: 1 });
VideoConsultationSchema.index({ scheduledStartTime: 1 });
VideoConsultationSchema.index({ sessionId: 1 }, { unique: true });

// Virtual for formatted start time
VideoConsultationSchema.virtual('formattedStartTime').get(function() {
  if (!this.scheduledStartTime) return 'Not scheduled';
  return new Date(this.scheduledStartTime).toLocaleString();
});

// Virtual for consultation duration (in minutes)
VideoConsultationSchema.virtual('calculatedDuration').get(function() {
  if (!this.actualStartTime || !this.actualEndTime) return 0;
  return Math.round((this.actualEndTime - this.actualStartTime) / (1000 * 60));
});

// Virtual for status display
VideoConsultationSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'scheduled': 'Appointment Scheduled',
    'ready': 'Ready to Join',
    'in-progress': 'Consultation in Progress',
    'completed': 'Consultation Completed',
    'missed': 'Appointment Missed',
    'cancelled': 'Appointment Cancelled'
  };
  
  return statusMap[this.status] || this.status;
});

// Method to start consultation
VideoConsultationSchema.methods.startSession = function() {
  if (this.status !== 'ready' && this.status !== 'scheduled') {
    throw new Error(`Cannot start consultation in ${this.status} status`);
  }
  
  this.status = 'in-progress';
  this.actualStartTime = new Date();
  return this.save();
};

// Method to end consultation
VideoConsultationSchema.methods.endSession = function() {
  if (this.status !== 'in-progress') {
    throw new Error(`Cannot end consultation in ${this.status} status`);
  }
  
  this.status = 'completed';
  this.actualEndTime = new Date();
  this.duration = Math.round((this.actualEndTime - this.actualStartTime) / (1000 * 60));
  return this.save();
};

// Method to add consultation artifact
VideoConsultationSchema.methods.addArtifact = function(type, url, name, mimeType, createdBy) {
  this.artifacts.push({
    type,
    url,
    name,
    mimeType,
    createdBy,
    createdAt: new Date()
  });
  
  return this.save();
};

const VideoConsultation = mongoose.model('VideoConsultation', VideoConsultationSchema);

export default VideoConsultation;
