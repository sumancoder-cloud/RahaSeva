import Wallet from '../models/Wallet.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

/**
 * Wallet Controller - Handles wallet and rewards functionality
 * Supports the HelpHive Wallet + Rewards feature in the HelpHive platform
 */

// Get user wallet
export const getUserWallet = async (req, res) => {
  try {
    // Find wallet by user ID
    let wallet = await Wallet.findOne({ user: req.user.id });
    
    // If wallet doesn't exist, create one
    if (!wallet) {
      wallet = new Wallet({
        user: req.user.id,
        balance: {
          money: 0,
          points: 0
        }
      });
      
      await wallet.save();
    }
    
    res.json({
      success: true,
      data: {
        wallet: {
          balance: wallet.balance,
          formattedBalance: wallet.formattedBalance,
          rewardLevel: wallet.rewardLevel,
          referralCode: wallet.referralCode,
          lastUpdated: wallet.lastUpdated,
          totalEarned: wallet.totalEarned,
          totalSpent: wallet.totalSpent
        },
        transactions: wallet.transactions.slice(0, 10) // Return only last 10 transactions
      }
    });
  } catch (err) {
    console.error('Error in getUserWallet:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Add money to wallet
export const addMoneyToWallet = async (req, res) => {
  try {
    const { amount, paymentMethod, transactionId } = req.body;
    
    // Validate amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount greater than 0 is required' });
    }
    
    // Find wallet
    let wallet = await Wallet.findOne({ user: req.user.id });
    
    // If wallet doesn't exist, create one
    if (!wallet) {
      wallet = new Wallet({
        user: req.user.id
      });
    }
    
    // Add transaction
    wallet.addTransaction(
      'credit',
      parsedAmount,
      `Added ₹${parsedAmount.toFixed(2)} via ${paymentMethod || 'online payment'}`,
      true,
      transactionId
    );
    
    res.json({
      success: true,
      message: `Successfully added ₹${parsedAmount.toFixed(2)} to wallet`,
      data: {
        currentBalance: wallet.formattedBalance,
        transaction: wallet.transactions[wallet.transactions.length - 1]
      }
    });
  } catch (err) {
    console.error('Error in addMoneyToWallet:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Redeem points
export const redeemPoints = async (req, res) => {
  try {
    const { points } = req.body;
    
    // Validate points
    const pointsToRedeem = parseInt(points);
    if (isNaN(pointsToRedeem) || pointsToRedeem <= 0) {
      return res.status(400).json({ success: false, message: 'Valid number of points greater than 0 is required' });
    }
    
    // Find wallet
    const wallet = await Wallet.findOne({ user: req.user.id });
    
    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found' });
    }
    
    // Check if enough points
    if (wallet.balance.points < pointsToRedeem) {
      return res.status(400).json({ success: false, message: 'Insufficient points balance' });
    }
    
    // Minimum points requirement
    if (pointsToRedeem < 100) {
      return res.status(400).json({ success: false, message: 'Minimum 100 points required for redemption' });
    }
    
    // Redeem points
    await wallet.redeemPoints(pointsToRedeem);
    
    res.json({
      success: true,
      message: `Successfully redeemed ${pointsToRedeem} points`,
      data: {
        currentBalance: wallet.formattedBalance,
        rewardLevel: wallet.rewardLevel
      }
    });
  } catch (err) {
    console.error('Error in redeemPoints:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Apply referral code
export const applyReferralCode = async (req, res) => {
  try {
    const { referralCode } = req.body;
    
    if (!referralCode) {
      return res.status(400).json({ success: false, message: 'Referral code is required' });
    }
    
    // Check if user already has a referral
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Find wallet with this referral code
    const referrerWallet = await Wallet.findOne({ referralCode });
    
    if (!referrerWallet) {
      return res.status(404).json({ success: false, message: 'Invalid referral code' });
    }
    
    // Can't refer yourself
    if (referrerWallet.user.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot use your own referral code' });
    }
    
    // Find user's wallet
    let userWallet = await Wallet.findOne({ user: req.user.id });
    
    if (!userWallet) {
      userWallet = new Wallet({
        user: req.user.id
      });
    }
    
    // Check if already referred
    if (userWallet.referredBy) {
      return res.status(400).json({ success: false, message: 'You have already used a referral code' });
    }
    
    // Update user's wallet with referrer
    userWallet.referredBy = referrerWallet.user;
    
    // Give bonus points to new user
    userWallet.addTransaction(
      'point_earned',
      100,
      `Welcome bonus for using referral code ${referralCode}`,
      false
    );
    
    // Save user wallet
    await userWallet.save();
    
    // Give bonus to referrer
    await referrerWallet.addReferralBonus(req.user.id);
    
    res.json({
      success: true,
      message: 'Referral code applied successfully. You earned 100 bonus points!',
      data: {
        currentBalance: userWallet.formattedBalance
      }
    });
  } catch (err) {
    console.error('Error in applyReferralCode:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Get transaction history
export const getTransactionHistory = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user.id });
    
    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found' });
    }
    
    // Get page and limit
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // Calculate skip
    const skip = (page - 1) * limit;
    
    // Sort transactions by date
    const transactions = wallet.transactions
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(skip, skip + limit);
    
    res.json({
      success: true,
      count: wallet.transactions.length,
      page,
      totalPages: Math.ceil(wallet.transactions.length / limit),
      data: transactions
    });
  } catch (err) {
    console.error('Error in getTransactionHistory:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Get reward points details
export const getRewardPointsDetails = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user.id });
    
    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found' });
    }
    
    // Calculate rewards based on level
    const rewards = {
      bronze: {
        cashbackRate: 1, // 1%
        bookingDiscount: 0,
        pointsPerBooking: 10,
        nextLevel: 'silver',
        pointsToNextLevel: 500 - wallet.balance.points
      },
      silver: {
        cashbackRate: 2, // 2%
        bookingDiscount: 5, // 5%
        pointsPerBooking: 20,
        nextLevel: 'gold',
        pointsToNextLevel: 2000 - wallet.balance.points
      },
      gold: {
        cashbackRate: 3, // 3%
        bookingDiscount: 10, // 10%
        pointsPerBooking: 30,
        nextLevel: 'platinum',
        pointsToNextLevel: 5000 - wallet.balance.points
      },
      platinum: {
        cashbackRate: 5, // 5%
        bookingDiscount: 15, // 15%
        pointsPerBooking: 50,
        nextLevel: null,
        pointsToNextLevel: 0
      }
    };
    
    // Get current level benefits
    const currentLevel = rewards[wallet.rewardLevel];
    
    res.json({
      success: true,
      data: {
        currentPoints: wallet.balance.points,
        currentLevel: wallet.rewardLevel,
        benefits: currentLevel,
        pointsEarnedThisMonth: wallet.transactions
          .filter(t => 
            !t.isMoney && 
            t.type.includes('point') && 
            t.createdAt > new Date(new Date().setDate(1))
          )
          .reduce((sum, t) => sum + t.amount, 0)
      }
    });
  } catch (err) {
    console.error('Error in getRewardPointsDetails:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Pay for booking using wallet
export const payFromWallet = async (req, res) => {
  try {
    const { bookingId, amount, serviceId } = req.body;
    
    if (!bookingId || !amount) {
      return res.status(400).json({ success: false, message: 'Booking ID and amount are required' });
    }
    
    const parsedAmount = parseFloat(amount);
    
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount greater than 0 is required' });
    }
    
    // Find wallet
    const wallet = await Wallet.findOne({ user: req.user.id });
    
    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found' });
    }
    
    // Check if enough balance
    if (wallet.balance.money < parsedAmount) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
    }
    
    // Pay from wallet
    await wallet.payForBooking(parsedAmount, bookingId, serviceId);
    
    res.json({
      success: true,
      message: `Payment of ₹${parsedAmount.toFixed(2)} made successfully`,
      data: {
        currentBalance: wallet.formattedBalance,
        transaction: wallet.transactions[wallet.transactions.length - 1]
      }
    });
  } catch (err) {
    console.error('Error in payFromWallet:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
