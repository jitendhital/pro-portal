import express from 'express';
import {
    createBooking,
    getSellerBookings,
    getBuyerBookings,
    updateBookingStatus,
    cancelBooking,
    getBookingStats,
} from '../controllers/booking.controller.js';
import { verifyToken } from '../middleware/verifyUser.js';

const router = express.Router();

// Create a new booking
router.post('/create', verifyToken, createBooking);

// Get bookings for seller (visit requests to their properties)
router.get('/seller/:userId', verifyToken, getSellerBookings);

// Get bookings for buyer (their scheduled visits)
router.get('/buyer/:userId', verifyToken, getBuyerBookings);

// Update booking status (approve/reject)
router.put('/status/:bookingId', verifyToken, updateBookingStatus);

// Cancel a booking
router.delete('/:bookingId', verifyToken, cancelBooking);

// Get booking statistics
router.get('/stats/:userId', verifyToken, getBookingStats);

export default router;
