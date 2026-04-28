/*******************************************************************************
 * File:        groupRoutes.js
 * Description: Express router defining all /api/group endpoints for creating
 *              and retrieving study groups.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
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
groupRouter.get('/:groupId', protect, getGroupData)

export default groupRouter