import express, { NextFunction, Request, Response } from 'express';
import userRoutes from './routes/user.js'
import  errorMiddleWare  from './middlewares/error.js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { connectDB, connectRedis } from './utils/connection.js';
import productRoute from "./routes/product.js";


dotenv.config();

const port = process.env.PORT;

const app = express();

app.use(express.json())
connectDB();


const redisURI = process.env.REDIS_URI || "";
// const clientURL = process.env.CLIENT_URL || "";
export const redisTTL = process.env.REDIS_TTL || 60 * 60 * 4;


export const redis = connectRedis(redisURI);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log("first")
app.use("/api/v1/user",userRoutes);
app.use("/api/v1/product",productRoute);

app.use("/uploads", express.static("uploads"));

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    errorMiddleWare(err, req, res, next);
});
app.listen(port,() => {
    console.log(`app is listen on ${port}`)
}) 