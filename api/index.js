import express from 'express';
import mongoose from 'mongoose';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import dotenv from "dotenv";
dotenv.config();


// Connect to MongoDB then start server
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

mongoose
  .connect('mongodb+srv://jiten:jiten@pro-portal.r9ldr7q.mongodb.net/?retryWrites=true&w=majority&appName=pro-portal')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });

app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);

app.use((err, req, res, next)=>{  // Global error handling middleware
    console.error('Error:', err.message);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res. status(statusCode).json({
        success: false,
        statusCode,
        message,
});

});
