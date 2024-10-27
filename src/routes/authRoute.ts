import express from 'express';
import { createCurrentUser, getCurrentUser, updateCurrentUser } from '../controllers/authController';
import { jwtCheck, jwtParse } from '../middlewear/auth';


const router = express.Router();

router.post('/register', jwtCheck, createCurrentUser);
router.get('/', jwtCheck, jwtParse, getCurrentUser);
router.put('/', jwtCheck, jwtParse, updateCurrentUser);







export default router;