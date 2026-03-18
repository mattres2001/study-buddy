import express from 'express'
import { upload } from '../configs/multer.js'
import { protect } from '../middleware/auth.js'
import { 
    startMeeting,
    endMeeting 
} from '../controllers/meetingController.js'

const meetingRouter = express.Router();

meetingRouter.post('/start', protect, startMeeting)
meetingRouter.post('/end', protect, endMeeting)

export default meetingRouter