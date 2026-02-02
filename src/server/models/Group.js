import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
    groupID: { type: String, required: true},
    groupName: { type: string, required: true},
    description: { type: string, default: ''},

    members: [{ type: string, ref: 'User'}],
    admins: [{ type: string, ref: 'User'}]
}, {timestamps: true});

const group = mongoose.model('groupSchema', groupSchema);

export default group;