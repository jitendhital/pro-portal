import express from 'express';
import { createBooking, getBookings, updateBookingStatus, getBooking, cancelBooking, deleteBooking } from '../controllers/booking.controller.js';
import { verifyToken } from '../middleware/verifyUser.js';

const router = express.Router();

router.post('/create', verifyToken, createBooking);
router.get('/get', verifyToken, getBookings);
router.get('/get/:bookingId', verifyToken, getBooking);
router.put('/update/:bookingId', verifyToken, updateBookingStatus);
router.post('/cancel/:bookingId', verifyToken, cancelBooking);
router.delete('/delete/:bookingId', verifyToken, deleteBooking);

export default router;
