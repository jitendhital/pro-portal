import Listing from '../models/listing.model.js';
import { errorHandler } from '../utils/errors.js';

export const createListing = async (req, res, next) => {
  try {
    // Set userRef from authenticated user
    const listingData = {
      ...req.body,
      userRef: req.user.id,
    };

    // Validate required fields (discountPrice is only required if offer is true)
    const requiredFields = ['name', 'description', 'address', 'regularPrice', 'bathrooms', 'bedrooms', 'furnished', 'parking', 'type', 'offer', 'imageUrls'];
    const missingFields = requiredFields.filter(field => !listingData[field] && listingData[field] !== false);

    if (missingFields.length > 0) {
      return next(errorHandler(400, `Missing required fields: ${missingFields.join(', ')}`));
    }

    // Convert price fields to numbers
    const regularPrice = parseFloat(listingData.regularPrice);

    // Validate price fields
    if (isNaN(regularPrice) || regularPrice <= 0) {
      return next(errorHandler(400, 'Regular price must be greater than 0'));
    }

    // discountPrice is only required and validated if offer is true
    let discountPrice = 0;
    if (listingData.offer) {
      if (listingData.discountPrice === undefined || listingData.discountPrice === null || listingData.discountPrice === '') {
        return next(errorHandler(400, 'Discount price is required when offer is enabled'));
      }
      discountPrice = parseFloat(listingData.discountPrice);

      if (isNaN(discountPrice) || discountPrice < 0) {
        return next(errorHandler(400, 'Discount price must be a valid non-negative number'));
      }

      if (discountPrice >= regularPrice) {
        return next(errorHandler(400, 'Discount price must be less than regular price when offer is true'));
      }
    } else {
      // If offer is false, set discountPrice to 0
      discountPrice = 0;
    }

    // Convert and validate numeric fields
    const bathrooms = parseInt(listingData.bathrooms);
    const bedrooms = parseInt(listingData.bedrooms);

    if (isNaN(bathrooms) || bathrooms < 0 || isNaN(bedrooms) || bedrooms < 0) {
      return next(errorHandler(400, 'Bathrooms and bedrooms must be non-negative numbers'));
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

    // Create listing with properly typed values
    const listing = await Listing.create({
      ...listingData,
      regularPrice,
      discountPrice,
      bathrooms,
      bedrooms,
    });

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

export const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return next(errorHandler(404, 'Listing not found'));
    }

    // Verify that the user owns this listing
    if (req.user.id !== listing.userRef) {
      return next(errorHandler(403, 'You can only delete your own listings'));
    }

    await Listing.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Listing has been deleted',
    });
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return next(errorHandler(404, 'Listing not found'));
    }

    // Verify that the user owns this listing
    if (req.user.id !== listing.userRef) {
      return next(errorHandler(403, 'You can only update your own listings'));
    }

    // Convert price fields to numbers if provided
    const updateData = { ...req.body };

    if (updateData.regularPrice !== undefined) {
      updateData.regularPrice = parseFloat(updateData.regularPrice);
      if (isNaN(updateData.regularPrice) || updateData.regularPrice <= 0) {
        return next(errorHandler(400, 'Regular price must be greater than 0'));
      }
    }

    // Handle discountPrice based on offer status
    if (updateData.offer !== undefined) {
      if (updateData.offer) {
        // If offer is true, discountPrice is required
        if (updateData.discountPrice === undefined || updateData.discountPrice === null || updateData.discountPrice === '') {
          return next(errorHandler(400, 'Discount price is required when offer is enabled'));
        }
        updateData.discountPrice = parseFloat(updateData.discountPrice);
        if (isNaN(updateData.discountPrice) || updateData.discountPrice < 0) {
          return next(errorHandler(400, 'Discount price must be a valid non-negative number'));
        }
        // Validate discount price relationship with regular price
        const regularPriceToCheck = updateData.regularPrice !== undefined ? updateData.regularPrice : listing.regularPrice;
        if (updateData.discountPrice >= regularPriceToCheck) {
          return next(errorHandler(400, 'Discount price must be less than regular price when offer is true'));
        }
      } else {
        // If offer is false, set discountPrice to 0
        updateData.discountPrice = 0;
      }
    } else if (updateData.discountPrice !== undefined) {
      // If only discountPrice is being updated (not offer), validate it
      updateData.discountPrice = parseFloat(updateData.discountPrice);
      if (isNaN(updateData.discountPrice) || updateData.discountPrice < 0) {
        return next(errorHandler(400, 'Discount price must be a valid non-negative number'));
      }
      // If offer is currently true, validate the relationship
      const currentOffer = listing.offer;
      if (currentOffer) {
        const regularPriceToCheck = updateData.regularPrice !== undefined ? updateData.regularPrice : listing.regularPrice;
        if (updateData.discountPrice >= regularPriceToCheck) {
          return next(errorHandler(400, 'Discount price must be less than regular price when offer is true'));
        }
      }
    }

    // Convert numeric fields if provided
    if (updateData.bathrooms !== undefined) {
      updateData.bathrooms = parseInt(updateData.bathrooms);
      if (isNaN(updateData.bathrooms) || updateData.bathrooms < 0) {
        return next(errorHandler(400, 'Bathrooms must be a non-negative number'));
      }
    }

    if (updateData.bedrooms !== undefined) {
      updateData.bedrooms = parseInt(updateData.bedrooms);
      if (isNaN(updateData.bedrooms) || updateData.bedrooms < 0) {
        return next(errorHandler(400, 'Bedrooms must be a non-negative number'));
      }
    }

    // Validate type if provided
    if (updateData.type) {
      const validTypes = ['sale', 'rent'];
      if (!validTypes.includes(updateData.type.toLowerCase())) {
        return next(errorHandler(400, 'Type must be either "sale" or "rent"'));
      }
    }

    // Validate imageUrls if provided
    if (updateData.imageUrls !== undefined) {
      if (!Array.isArray(updateData.imageUrls) || updateData.imageUrls.length === 0) {
        return next(errorHandler(400, 'At least one image URL is required'));
      }
    }

    // Don't allow updating userRef
    delete updateData.userRef;

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    const { __v, ...listingResponse } = updatedListing._doc;

    return res.status(200).json({
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

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return next(errorHandler(404, 'Listing not found'));
    }

    return res.status(200).json({
      success: true,
      listing,
    });
  } catch (error) {
    next(error);
  }
};

export const getListings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;
    let offer = req.query.offer;

    if (offer === undefined || offer === 'false') {
      offer = { $in: [false, true] };
    }

    let furnished = req.query.furnished;

    if (furnished === undefined || furnished === 'false') {
      furnished = { $in: [false, true] };
    }

    let parking = req.query.parking;

    if (parking === undefined || parking === 'false') {
      parking = { $in: [false, true] };
    }

    let type = req.query.type;

    if (type === undefined || type === 'all') {
      type = { $in: ['sale', 'rent'] };
    }

    const searchTerm = req.query.searchTerm || '';

    const sort = req.query.sort || 'createdAt';

    const order = req.query.order || 'desc';

    const listings = await Listing.find({
      name: { $regex: searchTerm, $options: 'i' },
      offer,
      furnished,
      parking,
      type,
      ...(req.user && { userRef: { $ne: req.user.id } }),
    })
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};

export const getUserListings = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.userId) {
      return next(errorHandler(403, 'You can only view your own listings'));
    }

    const listings = await Listing.find({ userRef: req.params.userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      listings,
    });
  } catch (error) {
    next(error);
  }
};