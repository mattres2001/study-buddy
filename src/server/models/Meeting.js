import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
    ...BaseScheduleSchema.obj,
    participants: [{ type: String, ref: 'User' }],
}, {timestamps: true});

const Meeting = mongoose.model('Meeting', meetingSchema);

export default Meeting;