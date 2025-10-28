import express from 'express';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import { 
  getServiceCostEstimate,
  createCostEstimationTemplate,
  getEstimationTemplatesByServiceType,
  getServiceTypesWithEstimations
} from '../controllers/estimationController.js';

const router = express.Router();

// @route   POST /api/cost-estimator
// @desc    Get cost estimate for a service
// @access  Public
router.post('/', getServiceCostEstimate);

// @route   POST /api/cost-estimator/template
// @desc    Create cost estimation template (admin only)
// @access  Private (Admin)
router.post('/template', auth, authorize('admin'), createCostEstimationTemplate);

// @route   GET /api/cost-estimator/service/:serviceType
// @desc    Get all estimation templates for a service type
// @access  Public
router.get('/service/:serviceType', getEstimationTemplatesByServiceType);

// @route   GET /api/cost-estimator/services
// @desc    Get all service types with cost estimations
// @access  Public
router.get('/services', getServiceTypesWithEstimations);

export default router;
