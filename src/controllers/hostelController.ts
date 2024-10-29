import { Request, Response } from 'express';
import { Room, Hostel } from '../models/hostelModel'; // Ensure you use destructuring to get both models

export const createHostel = async (req: Request, res: Response): Promise<any> => {
    console.log("Request Body:", req.body); // Log the entire request body
    try {
        const {
            name,
            address,
            city,
            country,
            contactNumber,
            email,
            rooms,
        } = req.body;

        const userId = req.userId;

        if (!rooms || rooms.length === 0) {
            return res.status(400).json({
                message: 'No room data provided',
            });
        }

        // Save rooms if provided
        const savedRooms = await Room.insertMany(rooms);
        // Create a new hostel with the saved room IDs
        const newHostel = new Hostel({
            userId,
            name,
            address,
            city,
            country,
            contactNumber,
            email,
            rooms: savedRooms.map(room => room._id), // Store room IDs in the hostel
        });

        // Save the hostel
        const savedHostel = await newHostel.save();

        return res.status(201).json({
            message: 'Hostel created successfully',
            data: savedHostel,
        });
    } catch (error: any) {
        console.error("Error in createHostel:", error); // Log the error for debugging
        return res.status(500).json({
            message: 'Error creating hostel',
            error: error.message,
        });
    }
};

