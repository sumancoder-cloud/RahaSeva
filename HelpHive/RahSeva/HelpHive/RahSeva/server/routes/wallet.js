import express from 'express';
import auth from '../middleware/auth.js';
import { 
  getUserWallet,
  addMoneyToWallet,
  redeemPoints,
  applyReferralCode,
  getTransactionHistory,
  getRewardPointsDetails,
  payFromWallet
} from '../controllers/walletController.js';

const router = express.Router();

// @route   GET /api/wallet
// @desc    Get user wallet
// @access  Private
router.get('/', auth, getUserWallet);

// @route   POST /api/wallet/add
// @desc    Add money to wallet
// @access  Private
router.post('/add', auth, addMoneyToWallet);

// @route   POST /api/wallet/redeem
// @desc    Redeem points
// @access  Private
router.post('/redeem', auth, redeemPoints);

// @route   POST /api/wallet/referral
// @desc    Apply referral code
// @access  Private
router.post('/referral', auth, applyReferralCode);

// @route   GET /api/wallet/transactions
// @desc    Get transaction history
// @access  Private
router.get('/transactions', auth, getTransactionHistory);

// @route   GET /api/wallet/rewards
// @desc    Get reward points details
// @access  Private
router.get('/rewards', auth, getRewardPointsDetails);

// @route   POST /api/wallet/pay
// @desc    Pay for booking using wallet
// @access  Private
router.post('/pay', auth, payFromWallet);

export default router;
