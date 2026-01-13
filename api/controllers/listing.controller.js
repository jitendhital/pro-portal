import Listing from '../models/listing.model.js';
import { errorHandler } from '../utils/errors.js';

export const createListing = async (req, res, next) => {
  try {
    // Set userRef from authenticated user
    const listingData = {
      ...req.body,
      userRef: req.user.id,
    };

    // Validate required fields
    const requiredFields = ['name', 'description', 'address', 'regularPrice', 'discountPrice', 'bathrooms', 'bedrooms', 'furnished', 'parking', 'type', 'offer', 'imageUrls'];
    const missingFields = requiredFields.filter(field => !listingData[field] && listingData[field] !== false);
    
    if (missingFields.length > 0) {
      return next(errorHandler(400, `Missing required fields: ${missingFields.join(', ')}`));
    }

    // Validate price fields
    if (listingData.regularPrice <= 0) {
      return next(errorHandler(400, 'Regular price must be greater than 0'));
    }

    if (listingData.discountPrice < 0) {
      return next(errorHandler(400, 'Discount price cannot be negative'));
    }

    if (listingData.offer && listingData.discountPrice >= listingData.regularPrice) {
      return next(errorHandler(400, 'Discount price must be less than regular price when offer is true'));
    }

    // Validate numeric fields
    if (listingData.bathrooms < 0 || listingData.bedrooms < 0) {
      return next(errorHandler(400, 'Bathrooms and bedrooms must be non-negative'));
    }

    // Validate type
    const validTypes = ['sale', 'rent'];
    if (!validTypes.includes(listingData.type.toLowerCase())) {
      return next(errorHandler(400, 'Type must be either "sale" or "rent"'));
    }

    // Validate imageUrls is an array
    if (!Array.isArray(listingData.imageUrls) || listingData.imageUrls.length === 0) {
      return next(errorHandler(400, 'At least one image URL is required'));
    }

    const listing = await Listing.create(listingData);
    
    // Exclude sensitive data if any
    const { __v, ...listingResponse } = listing._doc;
    
    return res.status(201).json({
      success: true,
      listing: listingResponse,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const firstKey = Object.keys(error.errors)[0];
      const msg = firstKey ? error.errors[firstKey].message : 'Validation error';
      return next(errorHandler(400, msg));
    }
    next(error);
  }
};

// Stub functions for routes that are imported but not yet implemented
export const deleteListing = async (req, res, next) => {
  return next(errorHandler(501, 'Delete listing functionality not yet implemented'));
};

export const updateListing = async (req, res, next) => {
  return next(errorHandler(501, 'Update listing functionality not yet implemented'));
};

export const getListing = async (req, res, next) => {
  return next(errorHandler(501, 'Get listing functionality not yet implemented'));
};

export const getListings = async (req, res, next) => {
  return next(errorHandler(501, 'Get listings functionality not yet implemented'));
};