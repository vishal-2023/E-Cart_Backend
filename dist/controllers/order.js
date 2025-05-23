// import { //  $0, //  $0TTL } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import ErrorHandler from "../utils/utility-class.js";
import { reduceStock } from "../utils/cloudinary.js";
import { Cart } from "../models/Cart.js";
export const myOrders = TryCatch(async (req, res, next) => {
    const { id: user } = req.query;
    let orders = await Order.find({ user });
    return res.status(200).json({
        success: true,
        orders,
    });
});
export const allOrders = TryCatch(async (req, res, next) => {
    const key = `all-orders`;
    let orders = await Order.find().populate("user", "name");
    return res.status(200).json({
        success: true,
        orders,
    });
});
export const getSingleOrder = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const key = `order-${id}`;
    let order = await Order.findById(id).populate("user", "name");
    if (!order)
        return next(new ErrorHandler("Order Not Found", 404));
    // await //  $0.setex(key, //  $0TTL, JSON.stringify(order));
    return res.status(200).json({
        success: true,
        order,
    });
});
export const newOrder = TryCatch(async (req, res, next) => {
    const { shippingInfo, orderItems, user, subtotal, tax, shippingCharges, discount, total, } = req.body;
    if (!shippingInfo || !orderItems || !user || !subtotal || !tax || !total)
        return next(new ErrorHandler("Please Enter All Fields", 400));
    const cart = await Cart.findOne({ user: user });
    await Order.create({
        shippingInfo,
        orderItems,
        user,
        subtotal,
        tax,
        shippingCharges,
        discount,
        total,
    });
    await reduceStock(orderItems);
    await Cart.findByIdAndDelete(cart?._id);
    // await invalidateCache({
    //   product: true,
    //   order: true,
    //   admin: true,
    //   userId: user,
    //   productId: order.orderItems.map((i) => String(i.productId)),
    // });
    return res.status(201).json({
        success: true,
        message: "Order Placed Successfully",
    });
});
export const processOrder = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order)
        return next(new ErrorHandler("Order Not Found", 404));
    switch (order.status) {
        case "Processing":
            order.status = "Shipped";
            break;
        case "Shipped":
            order.status = "Delivered";
            break;
        default:
            order.status = "Delivered";
            break;
    }
    await order.save();
    // await invalidateCache({
    //   product: false,
    //   order: true,
    //   admin: true,
    //   userId: order.user,
    //   orderId: String(order._id),
    // });
    return res.status(200).json({
        success: true,
        message: "Order Processed Successfully",
    });
});
export const deleteOrder = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order)
        return next(new ErrorHandler("Order Not Found", 404));
    await order.deleteOne();
    // await invalidateCache({
    //   product: false,
    //   order: true,
    //   admin: true,
    //   userId: order.user,
    //   orderId: String(order._id),
    // });
    return res.status(200).json({
        success: true,
        message: "Order Deleted Successfully",
    });
});
