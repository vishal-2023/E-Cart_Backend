import mongoose, { Schema } from "mongoose";
import { Product } from "./product.js";

const cartItemSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity cannot be less than 1']
    },
    price: {
        type: Number,
        required: true
    }
});

const cartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema]
}, {
    timestamps: true,
    toJSON: { virtuals: true }
});

// Virtual for total price
cartSchema.virtual('totalPrice').get(function () {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

// Update product stock when item is added/removed
cartSchema.pre('save', async function (next) {
    for (const item of this.items) {
        const product = await Product.findById(item.product);
        if (!product) {
            throw new Error(`Product with ID ${item.product} not found`);
        }
        if (product.stock < item.quantity) {
            throw new Error(`Insufficient stock for ${product.name}`);
        }
    }
    next();
});

export const Cart = mongoose.model('Cart', cartSchema);