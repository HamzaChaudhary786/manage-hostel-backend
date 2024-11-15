import { Request, Response } from 'express';
import { Room, Hostel } from '../models/hostelModel'; // Ensure you use destructuring to get both models
import mongoose from 'mongoose';





export const createMyHostel = async (req: Request, res: Response): Promise<any> => {
    try {
        const existingHostel = await Hostel.findOne({ user: req.userId })

        if (existingHostel) {
            return res.status(409).json({
                message: 'You already have a hostel',
            });
        }

        const {
            name,
            address,
            imageUrl,
            city,
            country,
            contactNumber,
            email,
            rooms,
        } = req.body;

        if (!rooms || rooms.length === 0) {
            return res.status(400).json({
                message: 'No room data provided',
            });
        }

        // Save each room individually and collect their IDs
        const roomIds = await Promise.all(rooms.map(async (roomData: any) => {
            const newRoom = new Room(roomData);
            const savedRoom = await newRoom.save();
            return savedRoom._id;
        }));

        // Create a new hostel with the saved room IDs
        const newHostel = new Hostel({
            user: new mongoose.Types.ObjectId(req.userId),
            name,
            address,
            imageUrl,
            city,
            country,
            contactNumber,
            email,
            rooms: roomIds, // Store room IDs in the hostel
        });

        // Save the hostel
        const savedHostel = await newHostel.save();

        return res.status(201).json({
            message: 'Hostel created successfully',
            data: savedHostel,
        });
    } catch (error: any) {
        console.error("Error in createHostel:", error);
        return res.status(500).json({
            message: 'Error creating hostel',
            error: error.message,
        });
    }
};


export const updateMyHostel = async (req: Request, res: Response): Promise<any> => {

    try {

        const hostel = await Hostel.findOne
            ({ user: req.userId })

        if (!hostel) {
            return res.status(404).json({
                message: 'Hostel not found',
            });
        }




        const roomIds = await Promise.all(req.body.rooms.map(async (roomData: any) => {
            const newRoom = new Room(roomData);
            const savedRoom = await newRoom.save();
            return savedRoom._id;
        }));

        hostel.name = req.body.name;
        hostel.imageUrl = req.body.imageUrl;
        hostel.address = req.body.address;
        hostel.city = req.body.city;
        hostel.country = req.body.country;
        hostel.contactNumber = req.body.contactNumber;
        hostel.rooms = roomIds as any; // Store room IDs in the hostel



        await hostel.save();

        res.status(200).send(hostel)

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Something went wrong',
        });

    }

}

export const getMyHostel = async (req: Request, res: Response): Promise<any> => {
    try {
        // Find the hostel and populate the rooms field with room details
        const hostel = await Hostel.findOne({ user: req.userId }).populate("user").populate("rooms");;

        // Debugging log to check the hostel data
        console.log(hostel);

        if (!hostel) {
            return res.status(404).json({
                message: 'You do not have a hostel',
            });
        }

        res.status(200).json({
            message: 'Hostel retrieved successfully',
            data: hostel,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error fetching hostel',
        });
    }
};


