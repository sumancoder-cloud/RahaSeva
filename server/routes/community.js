import express from 'express';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import {
  registerAsVolunteer,
  getVolunteerProfile,
  updateVolunteerProfile,
  createHelpRequest,
  getUserHelpRequests,
  getVolunteerHelpRequests,
  getHelpRequestById,
  acceptHelpRequest,
  updateHelpRequestStatus,
  submitHelpRequestFeedback
} from '../controllers/communityController.js';

const router = express.Router();

/**
 * Community Help Routes
 * Handles community volunteer services and help requests
 */

// Volunteer routes
router.post('/volunteers/register', auth, registerAsVolunteer);
router.get('/volunteers/profile', auth, getVolunteerProfile);
router.put('/volunteers/profile', auth, updateVolunteerProfile);
router.get('/volunteers/requests', auth, getVolunteerHelpRequests);

// Help request routes
router.post('/help-requests', auth, createHelpRequest);
router.get('/help-requests', auth, getUserHelpRequests);
router.get('/help-requests/:id', auth, getHelpRequestById);
router.post('/help-requests/:id/accept', auth, acceptHelpRequest);
router.put('/help-requests/:id/status', auth, updateHelpRequestStatus);
router.post('/help-requests/:id/feedback', auth, submitHelpRequestFeedback);

// Admin routes
router.get('/admin/volunteers', auth, authorize('admin'), (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});
router.get('/admin/help-requests', auth, authorize('admin'), (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

export default router;
