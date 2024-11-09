import express from 'express';
import { param } from 'express-validator';
import { searchRestaurants, getSingleHostel } from '../controllers/searchHostelController';

const router = express.Router();



router.get('/search/:city',
    param("city")
        .isString()
        .notEmpty()
        .withMessage("City parament must be a valid string"),
    searchRestaurants
);

router.get('/:hostelId',
    param("hostelId")
        .isString()
        .notEmpty()
        .withMessage("HostelId parament must be a valid string"), getSingleHostel)



export default router;