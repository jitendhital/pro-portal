import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/errors.js";

export const signup = async (req, res,next) => {
//console.log(req.body);
const {username, email, password}= req.body;
const hashedPassword= bcryptjs.hashSync(password, 10);
const newUser = new User({username, email, password: hashedPassword});

try {
    await newUser.save();
res.status(201).json({message: 'User created successfully', user: newUser});

} catch (error) {
    next(errorHandler(500, 'Error creating user'));
    
}

}


