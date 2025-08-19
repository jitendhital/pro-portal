import express from 'express';
import mongoose from 'mongoose';
import userRouter from './routes/user.route.js';

// Connect to MongoDB
mongoose.connect('mongodb+srv://jiten:jiten@pro-portal.r9ldr7q.mongodb.net/?retryWrites=true&w=majority&appName=pro-portal')
const app = express();

app.listen(3000,()=>{
    console.log('Server is running on port 3000')
}
)

app.use('/api/user', userRouter);
