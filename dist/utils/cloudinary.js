import { v2 as cloudinary } from "cloudinary";
// import { //  $0 } from "../app.js";
import { Product } from "../models/product.js";
import { Review } from "../models/review.js";
cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret,
});
const getBase64 = (file) => `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
export const uploadMediaToCloudinary = async (files) => {
    const promises = files.map(async (file) => {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload(getBase64(file), (error, result) => {
                if (error)
                    return reject(error);
                resolve(result);
            });
        });
    });
    const result = await Promise.all(promises);
    return result.map((i) => ({
        public_id: i.public_id,
        url: i.secure_url,
    }));
};
export const deleteMediaFromCloudinary = async (publicIds) => {
    const promises = publicIds.map((id) => {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(id, (error, result) => {
                if (error)
                    return reject(error);
                resolve();
            });
        });
    });
    await Promise.all(promises);
};
// export const invalidateCache = async ({
//   product,
//   order,
//   admin,
//   review,
//   userId,
//   orderId,
//   productId,
// }: InvalidateCacheProps) => {
//   if (review) {
//     await //  $0.del([`reviews-${productId}`]);
//   }
//   if (product) {
//     const productKeys: string[] = [
//       "latest-products",
//       "categories",
//       "all-products",
//     ];
//     if (typeof productId === "string") productKeys.push(`product-${productId}`);
//     if (typeof productId === "object")
//       productId.forEach((i) => productKeys.push(`product-${i}`));
//     await //  $0.del(productKeys);
//   }
//   if (order) {
//     const ordersKeys: string[] = [
//       "all-orders",
//       `my-orders-${userId}`,
//       `order-${orderId}`,
//     ];
//     await //  $0.del(ordersKeys);
//   }
//   if (admin) {
//     await //  $0.del([
//       "admin-stats",
//       "admin-pie-charts",
//       "admin-bar-charts",
//       "admin-line-charts",
//     ]);
//   }
// };
export const reduceStock = async (orderItems) => {
    for (let i = 0; i < orderItems.length; i++) {
        const order = orderItems[i];
        const product = await Product.findById(order.productId);
        if (!product)
            throw new Error("Product Not Found");
        product.stock -= order.quantity;
        await product.save();
    }
};
export const findAverageRatings = async (productId) => {
    let totalRating = 0;
    const reviews = await Review.find({ product: productId });
    reviews.forEach((review) => {
        totalRating += review.rating;
    });
    const averateRating = Math.floor(totalRating / reviews.length) || 0;
    return {
        numOfReviews: reviews.length,
        ratings: averateRating,
    };
};
