/*******************************************************************************
 * File:        groupMessageRoutes.js
 * Description: Express router defining /api/group-message endpoints for sending
 *              and retrieving group chat messages.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import express from 'express'
import { sendGroupMessage, getGroupMessages } from '../controllers/groupMessageController.js'
import { upload } from '../configs/multer.js'
import { protect } from '../middleware/auth.js'

const groupMessageRouter = express.Router();

groupMessageRouter.post('/send', upload.single('image'), protect, sendGroupMessage);
groupMessageRouter.post('/get',  protect, getGroupMessages);

export default groupMessageRouter;
