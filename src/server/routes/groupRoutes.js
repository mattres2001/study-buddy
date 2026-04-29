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
    getGroupData,
    searchGroups,
    requestJoin,
    getJoinRequests,
    handleJoinRequest,
    updateGroup,
    deleteGroup,
    leaveGroup
} from '../controllers/groupController.js'
import { protect } from '../middleware/auth.js';
import { upload } from '../configs/multer.js';

const groupRouter = express.Router();

groupRouter.post('/create', protect, upload.fields([
    { name: 'group_picture', maxCount: 1 },
    { name: 'cover_photo', maxCount: 1 }
]), createGroup);
groupRouter.post('/search', protect, searchGroups)
groupRouter.post('/:groupId/leave', protect, leaveGroup)
groupRouter.post('/:groupId/join-request', protect, requestJoin)
groupRouter.get('/:groupId/join-requests', protect, getJoinRequests)
groupRouter.post('/:groupId/join-request/:requestUserId/handle', protect, handleJoinRequest)
groupRouter.put('/:groupId', protect, upload.fields([
    { name: 'group_picture', maxCount: 1 },
    { name: 'cover_photo', maxCount: 1 }
]), updateGroup)
groupRouter.delete('/:groupId', protect, deleteGroup)
groupRouter.get('/:groupId', protect, getGroupData)

export default groupRouter