import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/utility-class.js";
import { deleteMediaFromCloudinary, findAverageRatings, uploadMediaToCloudinary } from "../utils/cloudinary.js";
import { Product } from "../models/product.js";
// import { //  $0 } from "../app.js";
import { Review } from "../models/review.js";
import { User } from "../models/user.js";
// const //  $0TTL = Number(process.env.//  $0_TTL) || 3*60*60 ;
export const newProduct = TryCatch(async (req, res, next) => {
    const { productData } = req.body;
    if (!productData)
        return next(new ErrorHandler("Product data is missing", 400));
    const product = JSON.parse(`${productData}`);
    const { name, price, stock, category, description } = product;
    const photos = req.files;
    if (!photos)
        return next(new ErrorHandler("Please add Photo", 400));
    if (photos.length < 1)
        return next(new ErrorHandler("Please add atleast one Photo", 400));
    if (photos.length > 5)
        return next(new ErrorHandler("You can only upload 5 Photos", 400));
    if (!name || !price || !stock || !category || !description)
        return next(new ErrorHandler("Please enter All Fields", 400));
    // Upload Here
    const photosURL = await uploadMediaToCloudinary(photos);
    await Product.create({
        name,
        price,
        description,
        stock,
        category: category.toLowerCase(),
        photos: photosURL,
    });
    // await invalidateCache({ product: true, admin: true });
    return res.status(201).json({
        success: true,
        message: "Product Created Successfully",
    });
});
export const getlatestProducts = TryCatch(async (req, res, next) => {
    let products;
    // products = await //  $0.get("latest-products");
    if (products)
        products = JSON.parse(products);
    else {
        products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
        // console.log("000",//  $0TTL)
        // await //  $0.setex("latest-products", //  $0TTL, JSON.stringify(products));
    }
    return res.status(200).json({
        success: true,
        products,
    });
});
// Revalidate on New,Update,Delete Product & on New Order
export const getAllCategories = TryCatch(async (req, res, next) => {
    let categories;
    // categories = await //  $0.get("categories");
    if (categories)
        categories = JSON.parse(categories);
    else {
        categories = await Product.distinct("category");
        // await //  $0.setex("categories", 3*60*60, JSON.stringify(categories));
    }
    return res.status(200).json({
        success: true,
        categories,
    });
});
export const getAdminProducts = TryCatch(async (req, res, next) => {
    let products;
    // products = await //  $0.get("all-products");
    if (products)
        products = JSON.parse(products);
    else {
        products = await Product.find({});
        // await //  $0.setex("all-products", //  $0TTL, JSON.stringify(products));
    }
    return res.status(200).json({
        success: true,
        products,
    });
});
export const getSingleProduct = TryCatch(async (req, res, next) => {
    let product;
    const { id } = req.params;
    // console.log("ooooo",id)
    const key = `product-${id}`;
    // product = await //  $0.get(key);
    if (product)
        product = JSON.parse(product);
    else {
        product = await Product.findById({ _id: id });
        // console.log("mmmm",product)
        if (!product)
            return next(new ErrorHandler("Product Not Found", 404));
        // await //  $0.setex(key, 3*60*60, JSON.stringify(product));
    }
    return res.status(200).json({
        success: true,
        product,
    });
});
export const updateProduct = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const { name, price, stock, category, description } = req.body;
    const photos = req.files;
    const product = await Product.findById({ _id: id });
    if (!product)
        return next(new ErrorHandler("Product Not Found", 404));
    if (photos && photos.length > 0) {
        const photosURL = await uploadMediaToCloudinary(photos);
        const ids = product.photos.map((photo) => photo.public_id);
        await deleteMediaFromCloudinary(ids);
        if (product.photos) {
            product.photos = photosURL;
        }
    }
    if (name)
        product.name = name;
    if (price)
        product.price = price;
    if (stock)
        product.stock = stock;
    if (category)
        product.category = category;
    if (description)
        product.description = description;
    await product.save();
    // await invalidateCache({
    //     product: true,
    //     productId: String(product._id),
    //     admin: true,
    // });
    return res.status(200).json({
        success: true,
        message: "Product Updated Successfully",
    });
});
export const deleteProduct = TryCatch(async (req, res, next) => {
    const product = await Product.findById({ _id: req.params.id });
    if (!product)
        return next(new ErrorHandler("Product Not Found", 404));
    const ids = product.photos.map((photo) => photo.public_id);
    await deleteMediaFromCloudinary(ids);
    await product.deleteOne();
    // await invalidateCache({
    //     product: true,
    //     productId: String(product._id),
    //     admin: true,
    // });
    return res.status(200).json({
        success: true,
        message: "Product Deleted Successfully",
    });
});
export const getAllProducts = TryCatch(async (req, res, next) => {
    const { search, sort, category, price } = req.query;
    const page = Number(req.query.page) || 1;
    const key = `products-${search}-${sort}-${category}-${price}-${page}`;
    let products;
    let totalPage;
    // const cachedData = await //  $0.get(key);
    // 1,2,3,4,5,6,7,8
    // 9,10,11,12,13,14,15,16
    // 17,18,19,20,21,22,23,24
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;
    const baseQuery = {};
    if (search)
        baseQuery.name = {
            $regex: search,
            $options: "i",
        };
    if (price)
        baseQuery.price = {
            $lte: Number(price),
        };
    if (category)
        baseQuery.category = category;
    const productsPromise = Product.find(baseQuery)
        .sort(sort && { price: sort === "asc" ? 1 : -1 })
        .limit(limit)
        .skip(skip);
    const [productsFetched, filteredOnlyProduct] = await Promise.all([
        productsPromise,
        Product.find(baseQuery),
    ]);
    products = productsFetched;
    totalPage = Math.ceil(filteredOnlyProduct.length / limit);
    // await //  $0.setex(key, 30, JSON.stringify({ products, totalPage }));
    return res.status(200).json({
        success: true,
        products,
        totalPage,
    });
});
export const allReviewsOfProduct = TryCatch(async (req, res, next) => {
    let reviews;
    const key = `reviews-${req.params.id}`;
    // reviews = await //  $0.get(key);
    if (reviews)
        reviews = JSON.parse(reviews);
    else {
        reviews = await Review.find({
            product: req.params.id,
        })
            .populate("user", "name photo")
            .sort({ updatedAt: -1 });
        // await //  $0.setex(key, Number(//  $0TTL), JSON.stringify(reviews));
    }
    return res.status(200).json({
        success: true,
        reviews,
    });
});
export const newReview = TryCatch(async (req, res, next) => {
    const user = await User.findById(req.query.id);
    if (!user)
        return next(new ErrorHandler("Not Logged In", 404));
    const product = await Product.findById(req.params.id);
    if (!product)
        return next(new ErrorHandler("Product Not Found", 404));
    const { comment, rating } = req.body;
    const alreadyReviewed = await Review.findOne({
        user: user._id,
        product: product._id,
    });
    if (alreadyReviewed) {
        alreadyReviewed.comment = comment;
        alreadyReviewed.rating = rating;
        await alreadyReviewed.save();
    }
    else {
        await Review.create({
            comment,
            rating,
            user: user._id,
            product: product._id,
        });
    }
    const { ratings, numOfReviews } = await findAverageRatings(product._id);
    product.ratings = ratings;
    product.numOfReviews = numOfReviews;
    await product.save();
    // await invalidateCache({
    //     product: true,
    //     productId: String(product._id),
    //     admin: true,
    //     review: true,
    // });
    return res.status(alreadyReviewed ? 200 : 201).json({
        success: true,
        message: alreadyReviewed ? "Review Update" : "Review Added",
    });
});
export const deleteReview = TryCatch(async (req, res, next) => {
    const user = await User.findById(req.query.id);
    if (!user)
        return next(new ErrorHandler("Not Logged In", 404));
    const review = await Review.findById(req.params.id);
    if (!review)
        return next(new ErrorHandler("Review Not Found", 404));
    const isAuthenticUser = review.user.toString() === user._id.toString();
    if (!isAuthenticUser)
        return next(new ErrorHandler("Not Authorized", 401));
    await review.deleteOne();
    const product = await Product.findById(review.product);
    if (!product)
        return next(new ErrorHandler("Product Not Found", 404));
    const { ratings, numOfReviews } = await findAverageRatings(product._id);
    product.ratings = ratings;
    product.numOfReviews = numOfReviews;
    await product.save();
    // await invalidateCache({
    //     product: true,
    //     productId: String(product._id),
    //     admin: true,
    // });
    return res.status(200).json({
        success: true,
        message: "Review Deleted",
    });
});
