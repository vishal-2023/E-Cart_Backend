import express from 'express';
import { deleteUser, getAllUsers, getUser, loginUser, registerUser } from '../controllers/user.js';
import { adminOnly } from '../middlewares/auth.js';
const app = express.Router();
// app.post("/new", newUser);
app.post('/signup', registerUser);
app.post('/login', loginUser);
// Route - /api/v1/user/all
app.get("/all", adminOnly, getAllUsers);
// Route - /api/v1/user/dynamicID
app.route("/:id").get(getUser).delete(adminOnly, deleteUser);
export default app;
