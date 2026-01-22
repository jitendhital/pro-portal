import Booking from '../models/booking.model.js';
import Listing from '../models/listing.model.js';
import { errorHandler } from '../utils/errors.js';

export const createBooking = async (req, res, next) => {
  try {
    const { 
      propertyId, 
      date, 
      timeSlot, 
      message, 
      guests, 
      bbqEnabled, 
      chickenKg, 
      muttonKg, 
      fishKg, 
      campfireEnabled, 
      soundSystemEnabled, 
      totalPrice 
    } = req.body;
    const buyerId = req.user.id;

    // Validate required fields
    if (!propertyId || !date || totalPrice === undefined) {
      return next(errorHandler(400, 'Property ID, date, and total price are required'));
    }

    // For regular bookings, timeSlot is required
    // For night-stay bookings, timeSlot is optional
    const property = await Listing.findById(propertyId);
    if (!property) {
      return next(errorHandler(404, 'Property not found'));
    }

    const isNightStay = property.listingSubType === 'night-stay' || (property.type === 'rent' && property.bbqEnabled);
    
    if (!isNightStay && !timeSlot) {
      return next(errorHandler(400, 'Time slot is required for regular bookings'));
    }

    // Check if buyer is trying to book their own property
    if (property.userRef === buyerId) {
      return next(errorHandler(400, 'You cannot book a visit for your own property'));
    }

    // Validate date is in the future
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      return next(errorHandler(400, 'Booking date must be in the future'));
    }

    // Check for existing bookings on the same date/timeSlot
    if (timeSlot) {
      const existingBooking = await Booking.findOne({
        propertyId,
        date: bookingDate,
        timeSlot,
        status: { $in: ['pending', 'approved'] },
      });

      if (existingBooking) {
        return next(errorHandler(400, 'This time slot is already booked'));
      }
    } else {
      // For night-stay, check if date is already booked
      const existingBooking = await Booking.findOne({
        propertyId,
        date: bookingDate,
        status: { $in: ['pending', 'approved'] },
      });

      if (existingBooking) {
        return next(errorHandler(400, 'This date is already booked'));
      }
    }

    // Create booking
    const booking = await Booking.create({
      propertyId,
      buyerId,
      sellerId: property.userRef,
      date: bookingDate,
      timeSlot: timeSlot || null,
      message: message || '',
      guests: guests || 1,
      bbqEnabled: bbqEnabled || false,
      chickenKg: chickenKg || 0,
      muttonKg: muttonKg || 0,
      fishKg: fishKg || 0,
      campfireEnabled: campfireEnabled || false,
      soundSystemEnabled: soundSystemEnabled || false,
      totalPrice,
      status: 'pending',
    });

    const { __v, ...bookingResponse } = booking._doc;

    return res.status(201).json({
      success: true,
      booking: bookingResponse,
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

export const getBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type } = req.query; // 'buyer' or 'seller'

    let bookings;
    if (type === 'seller') {
      // Get bookings for properties owned by the user
      bookings = await Booking.find({ sellerId: userId })
        .sort({ createdAt: -1 });
    } else {
      // Get bookings made by the user
      bookings = await Booking.find({ buyerId: userId })
        .sort({ createdAt: -1 });
    }

    // Populate property and user details
    const User = (await import('../models/user.model.js')).default;
    const bookingsWithDetails = await Promise.all(
      bookings.map(async (booking) => {
        const property = await Listing.findById(booking.propertyId).select('name address imageUrls');
        const buyer = await User.findById(booking.buyerId).select('username email avatar');
        const seller = await User.findById(booking.sellerId).select('username email avatar');
        
        const propertyData = property 
          ? { ...property._doc || property, _id: property._id || booking.propertyId }
          : { _id: booking.propertyId, name: 'Property Deleted', address: 'N/A', imageUrls: [] };
        
        return {
          ...booking._doc,
          propertyId: propertyData,
          buyerId: buyer || { username: 'Unknown', email: 'N/A', avatar: '' },
          sellerId: seller || { username: 'Unknown', email: 'N/A', avatar: '' },
        };
      })
    );

    return res.status(200).json({
      success: true,
      bookings: bookingsWithDetails,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { status, sellerNote } = req.body;
    const userId = req.user.id;

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return next(errorHandler(400, 'Status must be either "approved" or "rejected"'));
    }

    // Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return next(errorHandler(404, 'Booking not found'));
    }

    // Verify user is the seller
    if (booking.sellerId !== userId) {
      return next(errorHandler(403, 'You can only update bookings for your own properties'));
    }

    // Can only update pending bookings
    if (booking.status !== 'pending') {
      return next(errorHandler(400, 'Can only update pending bookings'));
    }

    // Update booking status
    booking.status = status;
    if (sellerNote) {
      booking.sellerNote = sellerNote;
    }
    await booking.save();

    const { __v, ...bookingResponse } = booking._doc;

    return res.status(200).json({
      success: true,
      booking: bookingResponse,
    });
  } catch (error) {
    next(error);
  }
};

export const getBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return next(errorHandler(404, 'Booking not found'));
    }

    // Verify user has access to this booking
    if (booking.buyerId !== userId && booking.sellerId !== userId) {
      return next(errorHandler(403, 'You do not have access to this booking'));
    }

    // Populate property and user details
    const property = await Listing.findById(booking.propertyId).select('name address imageUrls');
    const User = (await import('../models/user.model.js')).default;
    const buyer = await User.findById(booking.buyerId).select('username email avatar');
    const seller = await User.findById(booking.sellerId).select('username email avatar');

    const propertyData = property 
      ? { ...property._doc || property, _id: property._id || booking.propertyId }
      : { _id: booking.propertyId, name: 'Property Deleted', address: 'N/A', imageUrls: [] };

    const bookingWithDetails = {
      ...booking._doc,
      propertyId: propertyData,
      buyerId: buyer || { username: 'Unknown', email: 'N/A', avatar: '' },
      sellerId: seller || { username: 'Unknown', email: 'N/A', avatar: '' },
    };

    return res.status(200).json({
      success: true,
      booking: bookingWithDetails,
    });
  } catch (error) {
    next(error);
  }
};

// Cancel a booking (by buyer)
export const cancelBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return next(errorHandler(404, 'Booking not found'));
    }

    // Only the buyer can cancel their booking
    if (booking.buyerId !== userId) {
      return next(errorHandler(403, 'You can only cancel your own bookings'));
    }

    // Can only cancel pending or approved bookings
    if (!['pending', 'approved'].includes(booking.status)) {
      return next(errorHandler(400, 'Cannot cancel this booking'));
    }

    booking.status = 'cancelled';
    await booking.save();

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};
