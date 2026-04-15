import mongoose from 'mongoose'

const baseScheduleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    groupId: { type: String, ref: 'Group' },
    started_by: { type: String, ref: 'User' },
    started_at: { type: Date, default: Date.now() },
    ended_at: { type: Date, default: null },
    location: { type: String },
    description: { type: String }
}, { timestamps: true, _id: false });

export default baseScheduleSchema