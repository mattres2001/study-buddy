import express from 'express';
import { 
    createEvent,
    getEvents
} from '../controllers/eventController.js'
import { protect } from '../middleware/auth.js';
import { upload } from '../configs/multer.js';

const eventRouter = express.Router();

eventRouter.post('/create', protect, upload.fields([
    { name: 'flyer_photo', maxCount: 1 }
]), createEvent);
eventRouter.get('/:groupId', protect, getEvents);

export default eventRouter