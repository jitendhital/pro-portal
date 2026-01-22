import express from 'express';
import { createBooking, getBookings, updateBookingStatus, getBooking, cancelBooking } from '../controllers/booking.controller.js';
import { verifyToken } from '../middleware/verifyUser.js';

const router = express.Router();

router.post('/create', verifyToken, createBooking);
router.get('/get', verifyToken, getBookings);
router.get('/get/:bookingId', verifyToken, getBooking);
router.put('/update/:bookingId', verifyToken, updateBookingStatus);
router.delete('/:bookingId', verifyToken, cancelBooking);

export default router;
