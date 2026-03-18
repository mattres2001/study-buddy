import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
    ...BaseScheduleSchema.obj,
    rsvp: [{ type: String, ref: 'User' }],
    visibility: { type: String, enum: ['public','private'], default: 'private' }
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

export default Event;