import express from "express";
import { addCartItem, deleteCartItem, getAllCart, updateCartItem } from "../controllers/Cart.js";
import { userOnly } from "../middlewares/auth.js";

const app = express.Router();

app.get("/get-all-Cart", userOnly, getAllCart);

app.post('/add-cart',userOnly, addCartItem)

app.put('/update-cart', userOnly,updateCartItem)

app.delete('/delete-cart/:itemId', userOnly,deleteCartItem)


export default app;