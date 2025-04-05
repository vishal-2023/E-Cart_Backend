import mongoose from "mongoose";
import { User } from "../models/user.js";
import ErrorHandler from "../utils/utility-class.js";
import { TryCatch } from "./error.js";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
export const adminOnly = TryCatch(async (req, res, next) => {
    const { id } = req.query;
    if (!id)
        return next(new ErrorHandler("Unathorised User", 401));
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorHandler("Invalid ID format", 400));
    }
    const user = await User.findOne({ _id: id });
    console.log("uss", user);
    if (!user)
        return next(new ErrorHandler("Unauthorized user", 401));
    if (user.role !== "admin")
        return next(new ErrorHandler("Access Denied", 403));
    next();
});
export const userOnly = TryCatch(async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return next(new ErrorHandler("Authorization token required", 401));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded?.userId);
    if (!user) {
        return next(new ErrorHandler("Access Denied", 403));
    }
    req.user = user;
    next();
});
