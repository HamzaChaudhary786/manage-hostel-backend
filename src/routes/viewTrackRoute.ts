import express from 'express';
import { createMyHostel, getMyHostel, updateMyHostel } from '../controllers/hostelController';
import { jwtCheck, jwtParse } from '../middlewear/auth';
import { viewTrackUsers, getViewTrackData } from '../controllers/viewTrackController';


const router = express.Router();


router.post('/view-track', jwtCheck, jwtParse, viewTrackUsers);

router.get('/view-track-data/:timeframe/:hostelId', jwtCheck, jwtParse, getViewTrackData)








export default router;