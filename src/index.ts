import express, { Request, Response } from 'express'
import 'dotenv/config'
import cors from 'cors'
import authRoute from './routes/authRoute'
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';



const app = express();

app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'https://mern-food-app-frontend-u8fs.onrender.com'], // Replace with your actual frontend URL
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

app.get('/health', async (req: Request, res: Response) => {

    res.send({ message: "Health ok!" })
})




app.listen(7000, () => {
    console.log("Server is running on port 7000")

})