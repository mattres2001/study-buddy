import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
    _id: {type: String, required: true},
    group: {type: String, ref: 'Group', required: true},
    started_by: {type: String, ref: 'User', required: true},
    started_at: {type: Date, default: Date.now},
    ended_at: {type: Date, default: null},
    participants: [{type: String, ref: 'User'}],
    location: {type: String, default: ''},
}, {timestamps: true});

const Meeting = mongoose.model('Meeting', meetingSchema);

export default Meeting;