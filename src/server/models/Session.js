/*******************************************************************************
 * File:        Session.js
 * Description: Mongoose schema and model definition for the Session document,
 *              extending BaseSchedule to represent live group study sessions.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import mongoose from 'mongoose';
import baseScheduleSchema from './BaseSchedule.js'

const sessionSchema = new mongoose.Schema({
    ...baseScheduleSchema.obj,
    participants: [{ type: String, ref: 'User' }],
    max_participants: { type: Number },
    duration_minutes: { type: Number },
    vibe: {
        text: String,
        emoji: String
    }
}, {timestamps: true});

const Session = mongoose.model('Session', sessionSchema);

export default Session;