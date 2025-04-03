import { TryCatch } from '../middlewares/error.js';
import { User } from '../models/user.js';
import ErrorHandler from '../utils/utility-class.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
// export const newUser = TryCatch(
//   async (
//     req: Request<{}, {}, NewUserRequestBody>,
//     res: Response,
//     next: NextFunction
//   ) => {
//     const { name, email, photo, gender, _id, dob } = req.body;
//     let user = await User.findById(_id);
//     if (user)
//       return res.status(200).json({
//         success: true,
//         message: `Welcome, ${user.name}`,
//       });
//     if (!_id || !name || !email || !photo || !gender || !dob)
//       return next(new ErrorHandler("Please add all fields", 400));
//     user = await User.create({
//       name,
//       email,
//       photo,
//       gender,
//       _id,
//       dob: new Date(dob),
//     });
//     return res.status(201).json({
//       success: true,
//       message: `Welcome, ${user.name}`,
//     });
//   }
// );
export const getAllUsers = TryCatch(async (req, res, next) => {
    const users = await User.find({});
    return res.status(200).json({
        success: true,
        users,
    });
});
export const getUser = TryCatch(async (req, res, next) => {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user)
        return next(new ErrorHandler("Invalid Id", 400));
    return res.status(200).json({
        success: true,
        user,
    });
});
export const deleteUser = TryCatch(async (req, res, next) => {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user)
        return next(new ErrorHandler("Invalid Id", 400));
    await user.deleteOne();
    return res.status(200).json({
        success: true,
        message: "User Deleted Successfully",
    });
});
export const registerUser = TryCatch(async (req, res, next) => {
    const { email, password, confirmPassword, name, role } = req.body;
    if (!email || !password || !confirmPassword || !name || !role) {
        return next(new ErrorHandler("All fields are required", 400));
    }
    if (password !== confirmPassword) {
        return next(new ErrorHandler("Passwords do not match", 400));
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new ErrorHandler("Email already in use", 400));
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
        email,
        password: hashedPassword,
        name,
        role
    });
    await newUser.save();
    // Respond with success
    res.status(201).json({
        message: 'User registered successfully',
        user: {
            email: newUser.email,
            name: newUser.name,
        },
    });
});
export const loginUser = TryCatch(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ErrorHandler("Email and password are required", 400));
    }
    const user = await User.findOne({ email });
    if (!user) {
        return next(new ErrorHandler("Invalid Credentials", 400));
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return next(new ErrorHandler("Invalid Credentials", 400));
    }
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '5h' });
    res.status(200).json({
        message: 'Login successful',
        token,
        user: {
            email: user.email,
            name: user.name,
        },
    });
});
// return next(new ErrorHandler("Please add all fields", 400));
