import express, { Request, Response } from 'express'
import 'dotenv/config'
import cors from 'cors'
import authRoute from './routes/authRoute'
import hostelRoute from './routes/hostelRoute'
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import bookingRoute from './routes/bookingRoute'
import searchHostelRoute from './routes/searchHostelsRoute'
// import "../src/controllers/bookingPendingFuction"


const app = express();

// app.use("/api/booking/checkout/webhook", express.raw({ type: "*/*" }));


app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'https://manage-hostel-frontend.onrender.com'], // Replace with your actual frontend URL
    credentials: true,
}));






mongoose.connect(process.env.MONGODB_URL as string).then(() => {
    console.log('Connected to MongoDB');

})




cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})




app.use('/api/auth', authRoute)
app.use('/api', hostelRoute)
app.use('/api/hostel', searchHostelRoute)
app.use('/api/room', bookingRoute)



app.get('/health', async (req: Request, res: Response) => {

    res.send({ message: "Health ok!" })
})




app.listen(7000, () => {
    console.log("Server is running on port 7000")

})