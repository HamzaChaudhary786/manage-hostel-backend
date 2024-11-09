import express from 'express';
import { createMyHostel, getMyHostel, updateMyHostel } from '../controllers/hostelController';
import { jwtCheck, jwtParse } from '../middlewear/auth';


const router = express.Router();


router.post('/hostel', jwtCheck, jwtParse, createMyHostel);
router.put('/hostel', jwtCheck, jwtParse, updateMyHostel);
router.get('/hostel', jwtCheck, jwtParse, getMyHostel)








export default router;