import mongoose from 'mongoose';

/**
 * Wallet Model - Manages user wallet for rewards, points and transactions
 * This supports the HelpHive Wallet + Rewards feature mentioned in the project requirements
 */
const WalletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  balance: {
    money: {
      type: Number,
      default: 0,
      min: 0
    },
    points: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  currency: {
    type: String,
    default: 'INR'
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    sparse: true
  },
  transactions: [
    {
      type: {
        type: String,
        enum: ['credit', 'debit', 'point_earned', 'point_redeemed', 'referral_bonus', 'booking_payment', 'emergency_service', 'refund'],
        required: true
      },
      amount: {
        type: Number,
        required: true
      },
      isMoney: {
        type: Boolean,
        default: true
      },
      description: {
        type: String,
        required: true
      },
      reference: {
        type: String  // Booking ID, Payment ID, etc.
      },
      bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
      },
      serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceProvider'
      },
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'cancelled'],
        default: 'completed'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  totalEarned: {
    money: {
      type: Number,
      default: 0
    },
    points: {
      type: Number,
      default: 0
    }
  },
  totalSpent: {
    money: {
      type: Number,
      default: 0
    },
    points: {
      type: Number,
      default: 0
    }
  },
  rewardLevel: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  rewardsEnabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
WalletSchema.index({ user: 1 }, { unique: true });
WalletSchema.index({ referralCode: 1 }, { sparse: true });
WalletSchema.index({ 'transactions.createdAt': -1 });
WalletSchema.index({ 'transactions.type': 1, 'transactions.status': 1 });

// Generate referral code
WalletSchema.pre('save', async function(next) {
  if (!this.referralCode) {
    // Generate a unique referral code using user ID and random characters
    const userId = this.user.toString().slice(-4);
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.referralCode = `RH${randomChars}${userId}`;
  }
  
  // Calculate reward level based on points
  if (this.balance.points >= 5000) {
    this.rewardLevel = 'platinum';
  } else if (this.balance.points >= 2000) {
    this.rewardLevel = 'gold';
  } else if (this.balance.points >= 500) {
    this.rewardLevel = 'silver';
  } else {
    this.rewardLevel = 'bronze';
  }
  
  next();
});

// Virtual for transaction history
WalletSchema.virtual('transactionHistory').get(function() {
  return this.transactions.sort((a, b) => b.createdAt - a.createdAt);
});

// Virtual for formatted balance
WalletSchema.virtual('formattedBalance').get(function() {
  return {
    money: `₹${this.balance.money.toFixed(2)}`,
    points: this.balance.points
  };
});

// Methods
WalletSchema.methods.addTransaction = function(type, amount, description, isMoney = true, reference = null, bookingId = null, serviceId = null) {
  this.transactions.push({
    type,
    amount,
    isMoney,
    description,
    reference,
    bookingId,
    serviceId,
    createdAt: Date.now()
  });
  
  // Update balance
  if (isMoney) {
    if (type === 'credit' || type === 'refund') {
      this.balance.money += amount;
      this.totalEarned.money += amount;
    } else if (type === 'debit' || type === 'booking_payment') {
      this.balance.money -= amount;
      this.totalSpent.money += amount;
    }
  } else {
    if (type === 'point_earned' || type === 'referral_bonus') {
      this.balance.points += amount;
      this.totalEarned.points += amount;
    } else if (type === 'point_redeemed') {
      this.balance.points -= amount;
      this.totalSpent.points += amount;
    }
  }
  
  this.lastUpdated = Date.now();
  return this.save();
};

// Convert points to money
WalletSchema.methods.redeemPoints = async function(pointsToRedeem, conversionRate = 0.25) {
  if (pointsToRedeem <= 0) {
    throw new Error('Points to redeem must be greater than 0');
  }
  
  if (pointsToRedeem > this.balance.points) {
    throw new Error('Insufficient points balance');
  }
  
  const moneyValue = pointsToRedeem * conversionRate;
  
  // Add transactions
  this.transactions.push({
    type: 'point_redeemed',
    amount: pointsToRedeem,
    isMoney: false,
    description: `Redeemed ${pointsToRedeem} points for ${moneyValue} ${this.currency}`,
    createdAt: Date.now()
  });
  
  this.transactions.push({
    type: 'credit',
    amount: moneyValue,
    isMoney: true,
    description: `Credit from ${pointsToRedeem} redeemed points`,
    createdAt: Date.now()
  });
  
  // Update balances
  this.balance.points -= pointsToRedeem;
  this.totalSpent.points += pointsToRedeem;
  
  this.balance.money += moneyValue;
  this.totalEarned.money += moneyValue;
  
  this.lastUpdated = Date.now();
  
  return this.save();
};

// Add points from service booking 
WalletSchema.methods.addBookingPoints = async function(amount, bookingId) {
  // Calculate points (10% of booking amount)
  const pointsEarned = Math.floor(amount * 0.1);
  
  return this.addTransaction(
    'point_earned',
    pointsEarned,
    `Earned ${pointsEarned} points for booking #${bookingId}`,
    false, // not money
    bookingId.toString(),
    bookingId
  );
};

// Add referral bonus
WalletSchema.methods.addReferralBonus = async function(referredUserId) {
  const REFERRAL_POINTS = 100; // Points for referring a new user
  
  return this.addTransaction(
    'referral_bonus',
    REFERRAL_POINTS,
    `Referral bonus for inviting a new user`,
    false, // not money
    referredUserId.toString()
  );
};

// Use wallet balance for payment
WalletSchema.methods.payForBooking = async function(amount, bookingId, serviceId) {
  if (amount <= 0) {
    throw new Error('Payment amount must be greater than 0');
  }
  
  if (amount > this.balance.money) {
    throw new Error('Insufficient wallet balance');
  }
  
  return this.addTransaction(
    'booking_payment',
    amount,
    `Payment for booking #${bookingId}`,
    true, // is money
    bookingId.toString(),
    bookingId,
    serviceId
  );
};

const Wallet = mongoose.model('Wallet', WalletSchema);

export default Wallet;
