import CostEstimation from '../models/CostEstimation.js';
import ServiceProvider from '../models/ServiceProvider.js';
import mongoose from 'mongoose';

/**
 * Cost Estimator Controller - Handles service cost estimation
 * This supports the Cost Estimator feature in the project
 */

// Get cost estimate
export const getServiceCostEstimate = async (req, res) => {
  try {
    const { 
      serviceType, 
      problemType, 
      conditions = {}, 
      location
    } = req.body;
    
    if (!serviceType || !problemType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Service type and problem type are required' 
      });
    }
    
    // Find matching cost estimation template
    let costEstimate = await CostEstimation.findOne({ 
      serviceType: serviceType.toLowerCase(),
      problemType: problemType.toLowerCase()
    });
    
    // If no specific template found, try to find a generic one for the service type
    if (!costEstimate) {
      costEstimate = await CostEstimation.findOne({ 
        serviceType: serviceType.toLowerCase(),
        problemType: 'general'
      });
    }
    
    // If still no template found, use a fallback approach
    if (!costEstimate) {
      // Find average provider prices for this service type
      const providers = await ServiceProvider.find({ 
        serviceType: serviceType.toLowerCase(),
        "verification.isVerified": true
      });
      
      let avgBasePrice = 0;
      if (providers.length > 0) {
        avgBasePrice = providers.reduce((sum, provider) => sum + provider.pricing.basePrice, 0) / providers.length;
      } else {
        // Default fallback prices by service type
        const fallbackPrices = {
          'plumber': 500,
          'electrician': 600,
          'carpenter': 700,
          'doctor': 1000,
          'emergency': 1200,
          'cleaning': 400,
          'painting': 800,
          'mechanic': 800,
          'tutor': 500,
          'gardener': 400,
          'other': 600
        };
        
        avgBasePrice = fallbackPrices[serviceType.toLowerCase()] || 600;
      }
      
      // Create an estimation
      const estimate = {
        estimatedPrice: Math.round(avgBasePrice),
        priceRange: {
          low: Math.round(avgBasePrice * 0.8),
          high: Math.round(avgBasePrice * 1.2)
        },
        timeEstimate: '1-2 hours',
        currency: 'INR',
        note: 'This is a general estimate. Actual price may vary based on specific requirements.'
      };
      
      return res.json({
        success: true,
        data: estimate,
        isGenericEstimate: true
      });
    }
    
    // Calculate price using the model
    const priceDetails = costEstimate.calculatePrice(conditions);
    
    // Add price range
    priceDetails.priceRange = {
      low: costEstimate.priceRangeLow,
      high: costEstimate.priceRangeHigh
    };
    
    // If location is provided, add nearby providers count
    let nearbyProvidersCount = 0;
    if (location && location.coordinates) {
      const [longitude, latitude] = location.coordinates.map(parseFloat);
      
      // Find providers within 10km
      const providers = await ServiceProvider.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            distanceField: 'distance',
            maxDistance: 10000, // 10km radius
            spherical: true,
            query: {
              serviceType: serviceType.toLowerCase(),
              "verification.isVerified": true
            }
          }
        },
        { $count: 'total' }
      ]);
      
      if (providers.length > 0) {
        nearbyProvidersCount = providers[0].total;
      }
    }
    
    res.json({
      success: true,
      data: {
        ...priceDetails,
        nearbyProvidersCount
      }
    });
  } catch (err) {
    console.error('Error in getServiceCostEstimate:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Create cost estimation template (admin only)
export const createCostEstimationTemplate = async (req, res) => {
  try {
    const { 
      serviceType,
      problemType,
      description,
      basePrice,
      priceRangeHigh,
      priceRangeLow,
      priceFactors,
      estimatedTime,
      partsCost,
      transportCost,
      emergencySurcharge
    } = req.body;
    
    // Validate required fields
    if (!serviceType || !problemType || !basePrice || !description || !priceRangeHigh || !priceRangeLow) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    // Check if template already exists
    const existingTemplate = await CostEstimation.findOne({
      serviceType: serviceType.toLowerCase(),
      problemType: problemType.toLowerCase()
    });
    
    if (existingTemplate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cost estimation template for this service and problem type already exists' 
      });
    }
    
    // Create new template
    const costEstimationTemplate = new CostEstimation({
      serviceType: serviceType.toLowerCase(),
      problemType: problemType.toLowerCase(),
      description,
      basePrice,
      priceRangeHigh,
      priceRangeLow,
      priceFactors: priceFactors || [],
      estimatedTime: estimatedTime || { hours: 1, minutes: 0 },
      partsCost: partsCost || 0,
      transportCost: transportCost || 0,
      emergencySurcharge: emergencySurcharge || 0
    });
    
    await costEstimationTemplate.save();
    
    res.status(201).json({
      success: true,
      message: 'Cost estimation template created successfully',
      data: costEstimationTemplate
    });
  } catch (err) {
    console.error('Error in createCostEstimationTemplate:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Get all estimation templates for a service type
export const getEstimationTemplatesByServiceType = async (req, res) => {
  try {
    const { serviceType } = req.params;
    
    const templates = await CostEstimation.find({ serviceType: serviceType.toLowerCase() });
    
    res.json({
      success: true,
      count: templates.length,
      data: templates
    });
  } catch (err) {
    console.error('Error in getEstimationTemplatesByServiceType:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Get all service types with cost estimations
export const getServiceTypesWithEstimations = async (req, res) => {
  try {
    const serviceTypes = await CostEstimation.distinct('serviceType');
    
    const result = [];
    
    // Get problem types for each service type
    for (const serviceType of serviceTypes) {
      const problemTypes = await CostEstimation.find({ serviceType })
        .select('problemType description')
        .lean();
      
      result.push({
        serviceType,
        problemTypes: problemTypes.map(pt => ({
          type: pt.problemType,
          description: pt.description
        }))
      });
    }
    
    res.json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (err) {
    console.error('Error in getServiceTypesWithEstimations:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
