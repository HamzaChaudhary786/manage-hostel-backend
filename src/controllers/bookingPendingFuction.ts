import cron from 'node-cron';
import { Booking } from '../models/hostelModel';

// Function to delete bookings that are pending for more than 30 minutes
const deleteExpiredBookings = async () => {
    console.log("Checking for expired bookings...");

    // Calculate the time 30 minutes ago
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    try {
        const result = await Booking.deleteMany({
            status: 'pending',
            createdAt: { $lte: thirtyMinutesAgo },
        });
        if (result.deletedCount > 0) {
            console.log(`Deleted ${result.deletedCount} expired bookings.`);
        }
    } catch (error) {
        console.error('Error deleting expired bookings:', error);
    }
};

// Schedule the cleanup job to run every minute (or any interval you prefer)
cron.schedule('* * * * *', deleteExpiredBookings);

export default deleteExpiredBookings;
