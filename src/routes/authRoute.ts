import express from 'express';
import { createCurrentUser, getCurrentUser, updateCurrentUser } from '../controllers/authController';
import { jwtCheck, jwtParse } from '../middlewear/auth';
import multer from 'multer';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, //5mb
    },
});

router.post('/', jwtCheck, createCurrentUser);
router.get('/', jwtCheck, jwtParse, getCurrentUser);
router.put('/', upload.single("imageFile"), jwtCheck, jwtParse, updateCurrentUser);







export default router;