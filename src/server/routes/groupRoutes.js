import express from 'express';
import { 
    createGroup,
    getGroupData
} from '../controllers/groupController.js'
import { protect } from '../middleware/auth.js';
import { upload } from '../configs/multer.js';

groupRouter.post('/create-group', protect, createGroup);

export default groupRouter