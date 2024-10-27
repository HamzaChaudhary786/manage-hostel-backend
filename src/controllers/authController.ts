import { Request, Response } from "express";
import User from "../models/authModel";
import cloudinary from "cloudinary";

export const createCurrentUser = async (req: Request, res: Response): Promise<any> => {


    try {
        console.log("hehehhe");


        const { auth0Id } = req.body;

        const existingUser = await User.findOne({ auth0Id });

        if (existingUser) {
            res.status(200).send();
            return; // Explicitly return to stop execution
        }

        const newUser = new User(req.body);
        await newUser.save();

        res.status(201).json(newUser.toObject());

    } catch (error) {

        console.error(error);
        res.status(500).json({
            message: 'An error occurred while creating the user.',
        });
    }



}


const uploadImage = async (file: Express.Multer.File) => {
    try {
        const base64Image = Buffer.from(file.buffer).toString("base64");
        const dataURI = `data:${file.mimetype};base64,${base64Image}`;
        const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
        return uploadResponse.url;
    } catch (error) {
        console.error("Error during image upload:", error);
        throw new Error("Image upload failed");
    }
};

export const updateCurrentUser = async (
    req: Request,
    res: Response
): Promise<any> => {
    try {
        const { addressLine1, city, country, username, phoneNumber, imageUrl } = req.body;

        let imageurl = imageUrl;
        // Upload image if a new file is provided
        if (req.file) {
            imageurl = await uploadImage(req.file as Express.Multer.File);
        }

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // Update user details
        user.username = username;
        user.addressLine1 = addressLine1;
        user.phoneNumber = phoneNumber;
        user.country = country;
        user.city = city;
        user.imageUrl = imageurl;

        await user.save();

        res.status(200).json({
            message: "User profile updated successfully",
            user,
        });

    } catch (error: any) {
        console.error("Error updating user:", error);
        res.status(500).json({
            message: 'Error Occurs Updating User',
            error: error.message,
        });
    }
};





export const getCurrentUser = async (
    req: Request,
    res: Response
): Promise<any> => {
    try {



        const currentUser = await User.findOne({ _id: req.userId });

        if (!currentUser) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        res.json(currentUser);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error Occurs Updating User',
        });
    }
};