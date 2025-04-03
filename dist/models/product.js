import mongoose, { Schema } from "mongoose";
// Define the schema for the product
const productSchema = new Schema({
    name: {
        type: String,
        required: [true, "Please enter Name"],
    },
    photos: [
        {
            public_id: {
                type: String,
                required: [true, "Please enter Public ID"],
            },
            url: {
                type: String,
                required: [true, "Please enter URL"],
            },
        },
    ],
    price: {
        type: Number,
        required: [true, "Please enter Price"],
    },
    stock: {
        type: Number,
        required: [true, "Please enter Stock"],
    },
    category: {
        type: String,
        required: [true, "Please enter Category"],
        trim: true,
    },
    description: {
        type: String,
        required: [true, "Please enter Description"],
    },
    ratings: {
        type: Number,
        default: 0,
    },
    numOfReviews: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
// Create the model with the interface
export const Product = mongoose.model("Product", productSchema);
