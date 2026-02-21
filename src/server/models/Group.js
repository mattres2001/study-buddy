import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
    _id: { type: String, required: true},
    groupName: { type: String, required: true, unique: true},
    description: { type: String, default: ''},
    members: [{ type: String, ref: 'User'}],
    admins: [{ type: String, ref: 'User'}]
}, {timestamps: true});

const Group = mongoose.model('Group', groupSchema);

export default Group;