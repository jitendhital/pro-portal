import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/errors.js";

export const signup = async (req, res,next) => {
//console.log(req.body);
const {username, email, password}= req.body;
// Basic validation
if(!username || !email || !password){
    return next(errorHandler(400, 'Username, email and password are required'));
}
if(typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string'){
    return next(errorHandler(400, 'Invalid payload'));
}
if(password.length < 6){
    return next(errorHandler(400, 'Password must be at least 6 characters'));
}
const hashedPassword= bcryptjs.hashSync(password, 10);
const newUser = new User({username, email, password: hashedPassword});

try {
    await newUser.save();
res.status(201).json({ success: true, message: 'User created successfully', user: newUser});

} catch (error) {
    if (error && error.code === 11000) {
        return next(errorHandler(409, 'User with that email or username already exists'));
    }
    if (error && error.name === 'ValidationError') {
        const firstKey = Object.keys(error.errors)[0];
        const msg = firstKey ? error.errors[firstKey].message : 'Invalid input';
        return next(errorHandler(400, msg));
    }
    // Forward the original error so the error middleware can expose message
    return next(error);
}

}


