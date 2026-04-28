/*******************************************************************************
 * File:        messagesRoutes.js
 * Description: Express router defining all /api/message endpoints for the SSE
 *              stream, sending messages, and retrieving chat history.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import express from 'express'
import { getChatMessages, sendMessage, sseController } from '../controllers/messageController.js'
import { upload } from '../configs/multer.js'
import { protect } from '../middleware/auth.js'

const messageRouter = express.Router();

messageRouter.get('/:userId', sseController);
messageRouter.post('/send', upload.single('image'), protect, sendMessage);
messageRouter.post('/get', protect, getChatMessages);

export default messageRouter