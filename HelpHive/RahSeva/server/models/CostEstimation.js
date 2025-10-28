import mongoose from 'mongoose';

/**
 * Cost Estimator Model - Handles service cost estimation
 * This supports the Cost Estimator feature mentioned in the project requirements
 */
const CostEstimationSchema = new mongoose.Schema({
  serviceType: {
    type: String,
    required: true,
    enum: ['plumber', 'electrician', 'carpenter', 'doctor', 'emergency', 'cleaning', 'painting', 'mechanic', 'tutor', 'gardener', 'other'],
    index: true
  },
  problemType: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  priceRangeHigh: {
    type: Number,
    required: true
  },
  priceRangeLow: {
    type: Number,
    required: true
  },
  priceFactors: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    multiplier: {
      type: Number,
      required: true,
      default: 1.0
    },
    additionalCost: {
      type: Number,
      default: 0
    }
  }],
  estimatedTime: {
    hours: {
      type: Number,
      required: true,
      min: 0
    },
    minutes: {
      type: Number,
      required: true,
      min: 0,
      max: 59
    }
  },
  partsCost: {
    type: Number,
    default: 0
  },
  transportCost: {
    type: Number,
    default: 0
  },
  emergencySurcharge: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  created: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better query performance
CostEstimationSchema.index({ serviceType: 1, problemType: 1 });

// Virtual for formatted price range
CostEstimationSchema.virtual('formattedPriceRange').get(function() {
  return `₹${this.priceRangeLow} - ₹${this.priceRangeHigh}`;
});

// Virtual for formatted estimated time
CostEstimationSchema.virtual('formattedTime').get(function() {
  if (this.estimatedTime.hours === 0) {
    return `${this.estimatedTime.minutes} minutes`;
  } else if (this.estimatedTime.minutes === 0) {
    return `${this.estimatedTime.hours} hour${this.estimatedTime.hours > 1 ? 's' : ''}`;
  } else {
    return `${this.estimatedTime.hours} hour${this.estimatedTime.hours > 1 ? 's' : ''} ${this.estimatedTime.minutes} minutes`;
  }
});

// Calculate price for specific conditions
CostEstimationSchema.methods.calculatePrice = function(conditions) {
  let totalPrice = this.basePrice;
  let appliedFactors = [];
  
  // Apply price factors based on conditions
  for (const factor of this.priceFactors) {
    if (conditions[factor.name]) {
      totalPrice = (totalPrice * factor.multiplier) + factor.additionalCost;
      appliedFactors.push(factor.name);
    }
  }
  
  // Add parts cost if needed
  if (conditions.includesParts) {
    totalPrice += this.partsCost;
    appliedFactors.push('parts');
  }
  
  // Add transport cost if needed
  if (conditions.includesTransport) {
    totalPrice += this.transportCost;
    appliedFactors.push('transport');
  }
  
  // Add emergency surcharge if needed
  if (conditions.isEmergency) {
    totalPrice += this.emergencySurcharge;
    appliedFactors.push('emergency');
  }
  
  return {
    estimatedPrice: Math.round(totalPrice),
    appliedFactors,
    timeEstimate: this.formattedTime,
    currency: this.currency
  };
};

const CostEstimation = mongoose.model('CostEstimation', CostEstimationSchema);

export default CostEstimation;
