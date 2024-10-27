import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    auth0Id: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        unique: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
    },
    phoneNumber: {
        type: String,
        unique: true
    },
    roles: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user', // Default value is 'user' if not specified
    },
    addressLine1: {
        type: String,
    },
    city: {
        type: String,
    },
    country: {
        type: String,
    },
    imageUrl: {
        type: String,
        default: 'https://placehold.co/600x400.png ',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const User = mongoose.model('User', userSchema);

export default User;
