import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
      enum: [
        '9:00 AM',
        '10:00 AM',
        '11:00 AM',
        '12:00 PM',
        '1:00 PM',
        '2:00 PM',
        '3:00 PM',
        '4:00 PM',
        '5:00 PM',
      ],
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
  },
  { timestamps: true }
);

// Index for efficient queries
bookingSchema.index({ seller: 1, status: 1 });
bookingSchema.index({ buyer: 1 });
bookingSchema.index({ listing: 1, date: 1, timeSlot: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
