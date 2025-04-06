import { Cart } from '../models/Cart.js';
import { TryCatch } from "../middlewares/error.js";
import { Product } from '../models/product.js';
import ErrorHandler from '../utils/utility-class.js';
export const getAllCart = TryCatch(async (req, res, next) => {
    const cart = await Cart.findOne({ user: req?.user?._id })
        .populate('items.product', 'name price photos description');
    res.status(200).json({
        status: true,
        cart
    });
});
export const addCartItem = TryCatch(async (req, res, next) => {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }
    console.log("pppp", req);
    let cart = await Cart.findOne({ user: req?.user?._id });
    console.log("carttt1111", cart);
    if (!cart) {
        cart = new Cart({ user: req?.user?._id, items: [] });
    }
    console.log("carttt2222", cart);
    const existingItem = cart.items.find(item => item.product.toString() === productId);
    console.log("existing item", existingItem);
    if (existingItem) {
        existingItem.quantity += quantity;
    }
    else {
        cart.items.push({
            product: productId,
            quantity,
            price: product.price
        });
    }
    console.log("existing item-1", existingItem);
    await cart.save();
    console.log("existing item-2", existingItem);
    return res.status(201).json({
        status: true,
        message: "Cart Item added successfully"
    });
});
// Update item quantity
export const updateCartItem = TryCatch(async (req, res, next) => {
    const { quantity, itemId } = req.body;
    const cart = await Cart.findOne({ user: req?.user?._id });
    if (!cart) {
        return next(new ErrorHandler("Cart Not Found ", 404));
    }
    const item = cart?.items.id(itemId);
    if (!item) {
        return next(new ErrorHandler("Item Not Found in cart", 404));
    }
    item.quantity = quantity;
    await cart.save();
    return res.status(200).json({
        status: true,
        message: "Cart item updates successfully"
    });
});
export const deleteCartItem = TryCatch(async (req, res, next) => {
    // console.log("first")
    const cart = await Cart.findOne({ user: req?.user?._id });
    if (!cart) {
        return next(new ErrorHandler("Cart Not Found", 404));
    }
    // console.log("oooo",req.params.itemId)
    // console.log("caar",cart)
    // cart.items.pull(req.params.itemId);
    // Find the index of the item to delete by matching the product ID
    const itemIndex = cart.items.findIndex(item => item.product.toString() === req.params.itemId);
    if (itemIndex === -1) {
        return next(new ErrorHandler("Item not found in cart", 404));
    }
    // Pull the item from the cart's items array
    cart.items.splice(itemIndex, 1);
    await cart.save();
    return res.status(200).json({
        status: true,
        message: "Cart item deleted successfully"
    });
});
