import mongoose from 'mongoose'

const baseScheduleSchema = ({
    title: { type: String, required: true },
    group: { type: String, ref: 'Group' },
    started_by: { type: String, ref: 'User' },
    started_at: { type: Date, default: Date.now() },
    ended_at: { type: Date, default: null } ,
    location: { type: String },
}, {timestamps: true});

const BaseSchedule = mongoose.model('BaseSchedule', baseScheduleSchema);

export default BaseSchedule