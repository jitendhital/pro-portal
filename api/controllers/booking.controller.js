import Booking from '../models/booking.model.js';
import Listing from '../models/listing.model.js';
import { errorHandler } from '../utils/errors.js';

// Create a new booking
export const createBooking = async (req, res, next) => {
    try {
        const { listingId, date, timeSlot, message } = req.body;
        const buyerId = req.user.id;

        // Get the listing to find the seller
        const listing = await Listing.findById(listingId);
        if (!listing) {
            return next(errorHandler(404, 'Listing not found'));
        }

        // Prevent booking own property
        if (listing.userRef === buyerId) {
            return next(errorHandler(400, 'You cannot book a visit to your own property'));
        }

        // Check if there's already a booking for this slot
        const existingBooking = await Booking.findOne({
            listing: listingId,
            date: new Date(date),
            timeSlot,
            status: { $in: ['pending', 'approved'] },
        });

        if (existingBooking) {
            return next(errorHandler(400, 'This time slot is already booked'));
        }

        // Check if buyer already has a pending booking for this listing
        const buyerExistingBooking = await Booking.findOne({
            listing: listingId,
            buyer: buyerId,
            status: 'pending',
        });

        if (buyerExistingBooking) {
            return next(errorHandler(400, 'You already have a pending booking for this property'));
        }

        const booking = new Booking({
            listing: listingId,
            buyer: buyerId,
            seller: listing.userRef,
            date: new Date(date),
            timeSlot,
            message: message || '',
        });

        await booking.save();

        // Populate the booking with listing and user details
        const populatedBooking = await Booking.findById(booking._id)
            .populate('listing', 'name imageUrls address')
            .populate('buyer', 'username email avatar')
            .populate('seller', 'username email avatar');

        res.status(201).json({
            success: true,
            message: 'Booking request sent successfully',
            booking: populatedBooking,
        });
    } catch (error) {
        next(error);
    }
};

// Get all bookings for a seller (their properties)
export const getSellerBookings = async (req, res, next) => {
    try {
        const sellerId = req.params.userId;

        // Verify the user is requesting their own bookings
        if (req.user.id !== sellerId) {
            return next(errorHandler(403, 'You can only view your own bookings'));
        }

        const bookings = await Booking.find({ seller: sellerId })
            .populate('listing', 'name imageUrls address regularPrice type')
            .populate('buyer', 'username email avatar')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            bookings,
        });
    } catch (error) {
        next(error);
    }
};

// Get all bookings made by a buyer
export const getBuyerBookings = async (req, res, next) => {
    try {
        const buyerId = req.params.userId;

        // Verify the user is requesting their own bookings
        if (req.user.id !== buyerId) {
            return next(errorHandler(403, 'You can only view your own bookings'));
        }

        const bookings = await Booking.find({ buyer: buyerId })
            .populate('listing', 'name imageUrls address regularPrice type')
            .populate('seller', 'username email avatar')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            bookings,
        });
    } catch (error) {
        next(error);
    }
};

// Update booking status (approve/reject)
export const updateBookingStatus = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const { status, sellerNote } = req.body;

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return next(errorHandler(404, 'Booking not found'));
        }

        // Only the seller can approve/reject
        if (booking.seller.toString() !== req.user.id) {
            return next(errorHandler(403, 'Only the property owner can update this booking'));
        }

        // Can only update pending bookings
        if (booking.status !== 'pending') {
            return next(errorHandler(400, 'Can only update pending bookings'));
        }

        if (!['approved', 'rejected'].includes(status)) {
            return next(errorHandler(400, 'Invalid status'));
        }

        booking.status = status;
        if (sellerNote) {
            booking.sellerNote = sellerNote;
        }

        await booking.save();

        const updatedBooking = await Booking.findById(bookingId)
            .populate('listing', 'name imageUrls address')
            .populate('buyer', 'username email avatar')
            .populate('seller', 'username email avatar');

        res.status(200).json({
            success: true,
            message: `Booking ${status} successfully`,
            booking: updatedBooking,
        });
    } catch (error) {
        next(error);
    }
};

// Cancel a booking (by buyer)
export const cancelBooking = async (req, res, next) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return next(errorHandler(404, 'Booking not found'));
        }

        // Only the buyer can cancel their booking
        if (booking.buyer.toString() !== req.user.id) {
            return next(errorHandler(403, 'You can only cancel your own bookings'));
        }

        // Can only cancel pending or approved bookings
        if (!['pending', 'approved'].includes(booking.status)) {
            return next(errorHandler(400, 'Cannot cancel this booking'));
        }

        booking.status = 'cancelled';
        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
        });
    } catch (error) {
        next(error);
    }
};

// Get booking statistics for dashboard
export const getBookingStats = async (req, res, next) => {
    try {
        const userId = req.params.userId;

        if (req.user.id !== userId) {
            return next(errorHandler(403, 'You can only view your own stats'));
        }

        // Seller stats
        const sellerStats = await Booking.aggregate([
            { $match: { seller: userId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        // Buyer stats
        const buyerStats = await Booking.aggregate([
            { $match: { buyer: userId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        res.status(200).json({
            success: true,
            sellerStats,
            buyerStats,
        });
    } catch (error) {
        next(error);
    }
};
