/*******************************************************************************
 * File:        eventRoutes.js
 * Description: Express router defining all /api/event endpoints for creating,
 *              retrieving, updating, and deleting group events.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import express from 'express';
import {
    createEvent,
    getEvents,
    updateEvent,
    deleteEvent,
    rsvpEvent
} from '../controllers/eventController.js'
import { protect } from '../middleware/auth.js';
import { upload } from '../configs/multer.js';

const eventRouter = express.Router();

eventRouter.post('/create', protect, upload.fields([
    { name: 'flyer_photo', maxCount: 1 }
]), createEvent);
eventRouter.get('/:groupId', protect, getEvents);
eventRouter.patch('/:eventId/update', protect, updateEvent)
eventRouter.post('/:eventId/rsvp', protect, rsvpEvent)
eventRouter.delete('/:eventId', protect, deleteEvent)
export default eventRouter