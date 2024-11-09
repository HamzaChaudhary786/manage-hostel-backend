import express from 'express';
import { bookingRoom, getBookings, getMyHostelBookings, payForPendingBooking, stripeWebhookHandler } from '../controllers/bookingController';
import { jwtCheck, jwtParse } from '../middlewear/auth';


const router = express.Router();


router.post('/checkout/create-checkout-session', jwtCheck, jwtParse, bookingRoom);
router.post('/checkout/webhook', stripeWebhookHandler)

// get my booking route

router.get('/booking', jwtCheck, jwtParse, getBookings)

router.post('/checkout/create-checkout-session/:bookingId', jwtCheck, jwtParse, payForPendingBooking)

// get other client book my hostel

router.get("/my-hostel-booking", jwtCheck, jwtParse, getMyHostelBookings)

export default router;