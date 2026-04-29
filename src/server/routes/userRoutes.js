/*******************************************************************************
 * File:        userRoutes.js
 * Description: Express router defining all /api/user endpoints for profile
 *              retrieval, updates, follow/unfollow, connections, discovery,
 *              and user recommendations.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import express from 'express';
import {
    getUserData,
    updateUserData,
    discoverUsers,
    followUser,
    unfollowUser,
    sendConnectionRequest,
    acceptConnectionRequest,
    declineConnectionRequest,
    getUserConnections,
    getUserProfiles,
    getRecommendedUsers,
    getUsersByIds
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../configs/multer.js';
import { getUserRecentMessages } from '../controllers/messageController.js';

const userRouter = express.Router();

userRouter.get('/data', protect, getUserData);
userRouter.post('/update', protect, upload.fields([
    { name: 'profile', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
]), updateUserData);
userRouter.post('/discover', protect, discoverUsers);
userRouter.post('/follow', protect, followUser);
userRouter.post('/unfollow', protect, unfollowUser);
userRouter.post('/connect', protect, sendConnectionRequest);
userRouter.post('/accept', protect, acceptConnectionRequest);
userRouter.post('/decline', protect, declineConnectionRequest);
userRouter.get('/connections', protect, getUserConnections);
userRouter.post('/profiles', getUserProfiles)
userRouter.post('/by-ids', getUsersByIds)
userRouter.get('/recent-messages', protect, getUserRecentMessages)
userRouter.get('/recommendations', protect, getRecommendedUsers)

export default userRouter