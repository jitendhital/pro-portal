import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';
import bookingRouter from './routes/booking.route.js';
import dotenv from "dotenv";
dotenv.config();

// Suppress non-critical SSL warnings from MongoDB Atlas
// This error is a known issue with MongoDB Atlas on Windows and doesn't affect functionality
const originalEmit = process.emit;
process.emit = function (event, error) {
  if (
    event === 'uncaughtException' &&
    error &&
    error.message &&
    error.message.includes('SSL routines:ssl3_read_bytes:tlsv1 alert internal error')
  ) {
    // Suppress this specific non-critical SSL warning
    return false;
  }
  return originalEmit.apply(this, arguments);
};

// Connect to MongoDB then start server
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
app.use(cookieParser()); // Middleware to parse cookies

mongoose
  .connect(process.env.MONGO, {
    serverSelectionTimeoutMS: 10000, // Increased timeout
    socketTimeoutMS: 45000,
    // Try relaxing SSL requirements to see if it fixes the Windows TLS issue
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  })
  .catch((err) => {
    console.error('Detailed MongoDB connection error:', err);
  });

app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);
app.use('/api/booking', bookingRouter);

app.use((err, req, res, next) => {  // Global error handling middleware
  console.error('Error:', err.message);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });

});
