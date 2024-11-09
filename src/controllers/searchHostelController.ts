import { Types } from "mongoose";
import { Hostel } from "../models/hostelModel";
import { Request, Response } from "express";



interface Room extends Document {
    amenities: string[];
    type: string;
    availability: string;
}

interface Hostel extends Document {
    name: string;
    address: string;
    city: string;
    imageUrl: string;
    country: string;
    contactNumber: string;
    email: string;
    rooms: Types.DocumentArray<Room>;
    // Other fields in Hostel schema...
}

export const searchRestaurants = async (req: Request, res: Response): Promise<any> => {

    try {
        const city = req.params.city;
        const searchQuery = (req.query.searchQuery as string) || "";
        const selectedAmenities = (req.query.selectedAmenities as string) || "";
        const sortOption = (req.query.sortOption as string) || "lastUpdated";
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = 10;
        const skip = (page - 1) * pageSize;

        // Prepare initial query for city
        let matchQuery: any = { city: new RegExp(city, "i") };

        // Build the pipeline
        let pipeline: any[] = [
            { $match: matchQuery },
            {
                $lookup: {
                    from: "rooms", // collection name of rooms
                    localField: "rooms",
                    foreignField: "_id",
                    as: "rooms"
                }
            },
            { $unwind: "$rooms" } // Flatten the rooms array for amenity filtering
        ];

        // Check if any amenities are selected and add filter
        if (selectedAmenities) {
            const amenitiesArray = selectedAmenities.split(",").map(amenity => new RegExp(amenity, "i"));
            pipeline.push({
                $match: { "rooms.amenities": { $all: amenitiesArray } }
            });
        }

        // If there's a search query, add the relevant filters
        if (searchQuery) {
            const searchRegex = new RegExp(searchQuery, "i");
            pipeline.push({
                $match: {
                    $or: [
                        { name: searchRegex },
                        { "rooms.type": searchRegex },
                        { "rooms.availability": searchRegex }
                    ]
                }
            });
        }

        // Group by hostel and get only unique hostels with populated rooms
        pipeline.push(
            { $group: { _id: "$_id", doc: { $first: "$$ROOT" } } },
            { $replaceRoot: { newRoot: "$doc" } }
        );

        // Sort and paginate results
        pipeline.push(
            { $sort: { [sortOption]: 1 } },
            { $skip: skip },
            { $limit: pageSize }
        );

        // Execute the aggregation
        const hostels = await Hostel.aggregate(pipeline);

        // Count total documents for pagination
        const total = await Hostel.aggregate([...pipeline, { $count: "count" }]);
        const totalCount = total.length > 0 ? total[0].count : 0;

        // Construct response
        const response = {
            data: hostels,
            pagination: {
                total: totalCount,
                page,
                pages: Math.ceil(totalCount / pageSize)
            }
        };

        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }


};



export const getSingleHostel = async (req: Request, res: Response): Promise<any> => {
    try {
        const hostelId = req.params.hostelId;
        console.log(hostelId);

        const hostel = await Hostel.findById(hostelId).populate('rooms');

        if (!hostel) {
            return res.status(404).json({ message: "Hostel not found" }); // Add return here
        }

        res.json(hostel);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
