import express from 'express';
import { 
    createGroup,
    getGroupData
} from '../controllers/groupController.js'
import { protect } from '../middleware/auth.js';
import { upload } from '../configs/multer.js';

const groupRouter = express.Router();

groupRouter.post('/create', protect, upload.fields([
    { name: 'group_picture', maxCount: 1 },
    { name: 'cover_photo', maxCount: 1 }
]), createGroup);

export default groupRouter