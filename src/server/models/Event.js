/*******************************************************************************
 * File:        Event.js
 * Description: Mongoose schema and model definition for the Event document,
 *              extending BaseSchedule to represent group events with RSVP and
 *              visibility settings.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import mongoose from 'mongoose'
import baseScheduleSchema from './BaseSchedule.js'

const eventSchema = new mongoose.Schema({
    ...baseScheduleSchema.obj,
    rsvp: [{ type: String, ref: 'User' }],
    visibility: { type: String, enum: ['public','private'], default: 'private' },
    flyer_photo: {type: String, default: ''},
    status: { type: String, default: ''}
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

export default Event;