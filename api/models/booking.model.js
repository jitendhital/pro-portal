import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    propertyId: {
      type: String,
      required: true,
    },
    buyerId: {
      type: String,
      required: true,
    },
    sellerId: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: false, // Optional for night-stay bookings
    },
    message: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    sellerNote: {
      type: String,
      default: '',
    },
    // Night-Stay specific fields
    guests: {
      type: Number,
      min: 1,
      default: 1,
    },
    bbqEnabled: {
      type: Boolean,
      default: false,
    },
    chickenKg: {
      type: Number,
      min: 0,
      default: 0,
    },
    muttonKg: {
      type: Number,
      min: 0,
      default: 0,
    },
    fishKg: {
      type: Number,
      min: 0,
      default: 0,
    },
    campfireEnabled: {
      type: Boolean,
      default: false,
    },
    soundSystemEnabled: {
      type: Boolean,
      default: false,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
bookingSchema.index({ sellerId: 1, status: 1 });
bookingSchema.index({ buyerId: 1 });
bookingSchema.index({ propertyId: 1, date: 1, timeSlot: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
