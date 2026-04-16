import express from 'express'
import { upload } from '../configs/multer.js'
import { protect } from '../middleware/auth.js'
import { 
    startSession,
    getGroupSessions,
    updateSessionVibe,
    joinSession,
    endSession,
    getUpcomingGroupSessions,
    updateDescription

} from '../controllers/sessionController.js'

const sessionRouter = express.Router();

sessionRouter.post('/start', protect, startSession)
sessionRouter.get('/:groupId', protect, getGroupSessions)
sessionRouter.get('/:groupId/upcoming', protect, getUpcomingGroupSessions)
sessionRouter.patch('/:sessionId/vibe', protect, updateSessionVibe)
sessionRouter.post('/:sessionId/join', protect, joinSession)
sessionRouter.post('/:sessionId/end', protect, endSession)
sessionRouter.patch('/:sessionId/description', protect, updateDescription)

export default sessionRouter