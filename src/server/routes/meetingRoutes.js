import express from 'express'
import { upload } from '../configs/multer.js'
import { protect } from '../middleware/auth.js'
import { startMeeting } from '../controllers/meetingController.js'

const meetingRouter = express.Router();

meetingRouter.post('/start', protect, startMeeting)

export default meetingRouter