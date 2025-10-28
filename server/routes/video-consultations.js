import express from 'express';
import auth from '../middleware/auth.js';
import { 
  createVideoConsultation,
  getVideoConsultationById,
  startVideoConsultation,
  endVideoConsultation,
  addArtifact,
  submitFeedback,
  getUserVideoConsultations,
  getProviderVideoConsultations
} from '../controllers/videoController.js';

const router = express.Router();

// @route   POST /api/video-consultations
// @desc    Create a video consultation
// @access  Private
router.post('/', auth, createVideoConsultation);

// @route   GET /api/video-consultations/:id
// @desc    Get video consultation by ID
// @access  Private
router.get('/:id', auth, getVideoConsultationById);

// @route   PUT /api/video-consultations/:id/start
// @desc    Start video consultation (for providers)
// @access  Private
router.put('/:id/start', auth, startVideoConsultation);

// @route   PUT /api/video-consultations/:id/end
// @desc    End video consultation (for providers)
// @access  Private
router.put('/:id/end', auth, endVideoConsultation);

// @route   POST /api/video-consultations/:id/artifacts
// @desc    Add artifact to video consultation
// @access  Private
router.post('/:id/artifacts', auth, addArtifact);

// @route   POST /api/video-consultations/:id/feedback
// @desc    Submit feedback for video consultation
// @access  Private
router.post('/:id/feedback', auth, submitFeedback);

// @route   GET /api/video-consultations/user/consultations
// @desc    Get all video consultations for logged in user
// @access  Private
router.get('/user/consultations', auth, getUserVideoConsultations);

// @route   GET /api/video-consultations/provider/consultations
// @desc    Get all video consultations for logged in provider
// @access  Private
router.get('/provider/consultations', auth, getProviderVideoConsultations);

export default router;
