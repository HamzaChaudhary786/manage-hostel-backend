import mongoose from 'mongoose';

// Room Schema
const roomSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        default: () => new mongoose.Types.ObjectId(),
    },
    type: { type: String, required: true }, // e.g., Single, Double, Suite
    bedCount: { type: Number, required: true },
    pricePerNight: { type: Number, required: true },
    availability: {
        type: String,
        enum: ['available', 'booked'],
        default: 'available'
    },
    images: [String], // Array of image URLs
    amenities: [
        {
            type: String,
            enum: ['Wi-Fi', 'AC', 'TV', 'Fridge', 'Hot Tub', 'Geyser', 'Room Heater', 'Balcony', 'Breakfast Included'],
        }
    ],
});

// Booking Schema
const bookingSchema = new mongoose.Schema({
    bookingId: { type: String, required: true },
    userId: { type: String, required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    status: { type: String, enum: ['confirmed', 'pending', 'canceled'], required: true },
    paymentStatus: { type: String, enum: ['paid', 'pending'], required: true },
});

// Review Schema
const reviewSchema = new mongoose.Schema({
    reviewId: { type: String, required: true },
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
    userId: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String,
    createdAt: { type: Date, default: Date.now },
});

// Hostel Schema
const hostelSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String, required: true },
    rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }],
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
});

// Export the models as named exports
export const Hostel = mongoose.model('Hostel', hostelSchema);
export const Room = mongoose.model('Room', roomSchema);
export const Booking = mongoose.model('Booking', bookingSchema);
export const Review = mongoose.model('Review', reviewSchema);
