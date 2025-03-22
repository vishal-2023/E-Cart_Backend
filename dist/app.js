import express from 'express';
import userRoutes from './routes/user.js';
const port = 4000;
const app = express();
app.use("/api/v1/user", userRoutes);
app.listen(port, () => {
    console.log(`app is listen on ${port}`);
});
