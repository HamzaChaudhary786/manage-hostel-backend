import express from 'express';
import { createHostel } from '../controllers/hostelController';
import { jwtCheck, jwtParse } from '../middlewear/auth';


const router = express.Router();


router.post('/hostel', jwtCheck, jwtParse, createHostel);








export default router;