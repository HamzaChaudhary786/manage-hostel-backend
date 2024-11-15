// models/View.js
import mongoose from "mongoose";

const viewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    hostelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hostel',
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const View = mongoose.model('View', viewSchema);

export default View;