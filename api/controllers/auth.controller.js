import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/errors.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return next(errorHandler(400, "Username, email and password are required"));
  }
  if (
    typeof username !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return next(errorHandler(400, "Invalid payload"));
  }
  if (password.length < 6) {
    return next(errorHandler(400, "Password must be at least 6 characters"));
  }

  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });

  try {
    await newUser.save();
    // Never return password hashes
    const { password: _, ...safeUser } = newUser.toObject();
    res
      .status(201)
      .json({
        success: true,
        message: "User created successfully",
        user: safeUser,
      });
  } catch (error) {
    if (error && error.code === 11000) {
      return next(
        errorHandler(409, "User with that email or username already exists")
      );
    }
    if (error && error.name === "ValidationError") {
      const firstKey = Object.keys(error.errors)[0];
      const msg = firstKey
        ? error.errors[firstKey].message
        : "Invalid input";
      return next(errorHandler(400, msg));
    }
    return next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return next(errorHandler(400, "Email and password are required"));
  }
  if (typeof email !== "string" || typeof password !== "string") {
    return next(errorHandler(400, "Invalid payload"));
  }

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, 'User not found!'));
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, 'Wrong credentials!'));
    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
    const { password: pass, ...rest } = validUser._doc;
    res
      .cookie('access_token', token, { httpOnly: true })
      .status(200)
      .json(rest);
  } catch (error) {
    next(error);
  }

};
