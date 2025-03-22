import { Redis } from "ioredis";
import mongoose from "mongoose";

export const connectRedis = (redisURI: string) => {
    const redis = new Redis(redisURI);

    redis.on("connect", () => console.log("Redis Connected"));
    redis.on("error", (e) => console.log(e));

    return redis;
};

export const connectDB = () => {
    // console.log("firstooo",uri)
    mongoose
        .connect(`${process.env.MONGOURI}`)
        .then(() => console.log(`DB Connected successfully`))
        .catch((e) => {
            console.log(e);
            process.exit(1);
        });
};