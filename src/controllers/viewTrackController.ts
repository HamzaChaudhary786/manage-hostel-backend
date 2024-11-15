// routes/views.js
import { Request, Response } from 'express';
import View from '../models/viewTrackModel';
import mongoose from 'mongoose';

// Route to log a view
export const viewTrackUsers = async (req: Request, res: Response): Promise<any> => {
    const { hostelId } = req.body;

    const userId = req.userId;

    try {

        const existingView = await View.findOne({ userId });

        if (existingView) {
            return res.status(200).json({ message: 'View already tracked for this user and hostel' });
        }

        const view = new View({ userId, hostelId });
        await view.save();
        res.status(201).json({ message: 'View tracked successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error tracking view', error });
    }
};




export const getViewTrackData = async (req: Request, res: Response): Promise<any> => {
    const { timeframe, hostelId } = req.params;

   

    let startDate: Date;

    // Calculate start date based on timeframe
    switch (timeframe) {
        case 'week':
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);
            break;
        case 'month':
            startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 1);
            break;
        case 'year':
            startDate = new Date();
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
        default:
            return res.status(400).json({ message: 'Invalid timeframe' });
    }


    // Convert hostelId to ObjectId if it's a string (e.g., passed from a URL)
    const hostelObjectId = new mongoose.Types.ObjectId(hostelId);

    try {
        const views = await View.aggregate([
            // Step 1: Match documents based on hostelId and timestamp >= startDate
            {
                $match: {
                    hostelId: hostelObjectId, // Ensure hostelId is an ObjectId
                    timestamp: { $gte: startDate }, // Compare timestamp with startDate
                },
            },
            // Step 2: Group by date (remove time component)
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }, // Extract date part
                    },
                    count: { $sum: 1 }, // Count the occurrences for each date
                },
            },
            // Step 3: Sort the results by date in ascending order
            {
                $sort: { _id: 1 },
            },
        ]);


        if (views.length === 0) {
            return res.status(404).json({ message: 'No view data found for the given hostelId and timeframe' });
        }

        res.json(views);  // Send the response with the aggregated data

    } catch (error) {
        console.error('Error fetching view data:', error); // Log the error for better debugging
        res.status(500).json({ message: 'Error fetching view data', error });
    }
};