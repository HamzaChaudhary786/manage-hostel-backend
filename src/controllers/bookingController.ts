import mongoose, { AnyArray } from 'mongoose';
import { Booking, Hostel, Room } from '../models/hostelModel';
import { Request, Response } from "express";
import Stripe from 'stripe';



const FRONTEND_URL = process.env.FRONTEND_URL as string;

const stripe = new Stripe(process.env.STRIPE_API_KEY as string, {
    apiVersion: "2024-10-28.acacia",
});


export const stripeWebhookHandler = async (req: Request, res: Response): Promise<void> => {
    const sig = req.headers['stripe-signature'] as string;

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_ENDPOINT_SECRET as string
        );
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        try {
            // Find the booking using the Stripe session ID
            const booking = await Booking.findOne({ stripeSessionId: session.id });

            if (booking) {
                booking.status = 'confirmed';
                await booking.save();
                console.log(`Booking ${booking._id} has been confirmed.`);
            } else {
                console.error("Booking not found for this session ID.");
            }

            res.status(200).send();
        } catch (err: any) {
            console.error(`Failed to update booking status: ${err.message}`);
            res.status(500).send(`Failed to update booking: ${err.message}`);
        }
    } else {
        res.status(400).send("Unhandled event type");
    }
};



export const bookingRoom = async (req: Request, res: Response): Promise<void> => {
    try {
        const { hostelId, roomId, checkInDate, checkOutDate } = req.body;
        const userId = req.userId;

        // Validate input
        if (!userId || !roomId || !checkInDate || !checkOutDate) {
            res.status(400).json({ message: "All fields are required." });
            return;
        }

        // Find the room
        const room = await Room.findById({ _id: roomId });
        if (!room) {
            res.status(404).json({ message: "Room not found." });
            return;
        }

        const hostel = await Hostel.findById(hostelId)

        console.log(hostel, "hostel data");


        // Calculate the total price
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        const pricePerNight = Number(room.pricePerNight);
        const totalPrice = pricePerNight * nights;
        // Check room availability
        const isAvailable = await checkRoomAvailability(roomId, checkInDate, checkOutDate);
        if (!isAvailable) {
            res.status(409).json({ message: "Room is not available for the selected dates.", });
            return;
        }

        // Create a Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Room Booking - Room-786`,
                            description: `Type: ${room.type}, Duration: ${nights} Night(s)`,
                        },
                        unit_amount: 0, // Stripe amount in cents
                    },
                    quantity: 1,
                },

                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Total Dues',
                            description: 'Delivery',
                        },
                        unit_amount: (totalPrice * 100), // Example: 5 USD for shipping; adjust as needed
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${FRONTEND_URL.replace('https', 'http')}/booking-status`,
            cancel_url: `${FRONTEND_URL.replace('https', 'http')}/booking-cancel`,
            metadata: {
                userId,
                roomId,
                checkInDate,
                checkOutDate,
                totalPrice: totalPrice.toString(),
                nights: nights.toString(),
                roomType: room.type, // Include room type in metadata
            },
        });

        // Create a new booking with 'pending' status
        const newBooking = new Booking({
            bookingId: new mongoose.Types.ObjectId(),
            hostel,
            user: userId,
            roomId,
            checkInDate,
            checkOutDate,
            status: 'pending',
            stripeSessionId: session.id, // Store session ID for webhook
        });

        await newBooking.save();

        // Send session URL to the client
        res.status(200).json({ url: session.url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error });
    }
};

// Function to check room availability
const checkRoomAvailability = async (roomId: any, checkInDate: any, checkOutDate: any): Promise<boolean> => {
    const bookings = await Booking.find({
        roomId,
        $or: [
            { checkInDate: { $lt: checkOutDate, $gte: checkInDate } },
            { checkOutDate: { $gt: checkInDate, $lte: checkOutDate } },
        ],
    });

    return bookings.length === 0;
};



export const getBookings = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;

        // Fetch all bookings for the user
        const bookings = await Booking.find({ user:userId }).sort({ createdAt: -1 });

        if (!bookings || bookings.length === 0) {
            res.status(404).json({ message: "No bookings found." });
            return;
        }

        // Use Promise.all to fetch room data for each booking
        const bookingsWithRoomData = await Promise.all(
            bookings.map(async (booking) => {
                // Convert booking to plain object to avoid _doc TypeScript issue
                const bookingObject = booking.toObject();

                // Find room data using roomId from booking
                const room = await Room.findById(booking.roomId);

                return {
                    ...bookingObject, // Include booking data
                    room, // Include room data
                };
            })
        );

        res.status(200).json(bookingsWithRoomData);

    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }



}


export const payForPendingBooking = async (req: Request, res: Response): Promise<void> => {
    try {
        const { bookingId } = req.params;
        const userId = req.userId;

        // Find the booking by ID
        const booking = await Booking.findOne({ bookingId });
        console.log(booking, "booking data is available");

        if (!booking || booking.status !== 'pending') {
            res.status(404).json({ message: "Booking not found or already paid." });
            return;
        }

        // Fetch room details for the booking
        const room = await Room.findById(booking.roomId);
        if (!room) {
            res.status(404).json({ message: "Room not found." });
            return;
        }

        const checkIn = new Date(booking.checkInDate);
        const checkOut = new Date(booking.checkOutDate);
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        const pricePerNight = Number(room.pricePerNight);
        const totalPrice = pricePerNight * nights;
        // const checkInDate=booking.checkInDate as Date;
        // const checkOutDate = booking.checkOutDate as Date;
        // const roomId = booking.roomId;


        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Room Booking - Room-786`,
                            description: `Type: ${room.type}, Duration: ${nights} Night(s)`,
                        },
                        unit_amount: 0, // Stripe amount in cents
                    },
                    quantity: 1,
                },

                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Total Dues',
                            description: 'Delivery',
                        },
                        unit_amount: (totalPrice * 100), // Example: 5 USD for shipping; adjust as needed
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${FRONTEND_URL.replace('https', 'http')}`,
            cancel_url: `${FRONTEND_URL.replace('https', 'http')}/booking-cancel`,
            metadata: {
                userId,
                // roomId: booking.roomId as any,
                // checkInDate:booking.checkInDate as any,
                // checkOutDate:booking.checkOutDate as any,
                totalPrice: totalPrice.toString(),
                nights: nights.toString(),
                roomType: room.type, // Include room type in metadata
            },
        });


        res.status(200).json({ url: session.url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create a payment session" });
    }
};





export const getMyHostelBookings = async (req: Request, res: Response): Promise<any> => {

    try {

        const hostel = await Hostel.findOne({ user: req.userId })

        if (!hostel) {
            return res.status(404).json({
                message: 'hostel not found',
            });
        }

        const bookings = await Booking.find({ hostel: hostel._id }).populate("hostel").populate("user")

        console.log("i am not working", bookings);
        res.status(201).json(bookings);


    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error fetching restaurant',
        });

    }




}

