import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
    _id: { type: String, required: true},
    name: { type: String, required: true, unique: true},
    description: { type: String, default: ''},
    group_picture: {type: String, default: ''},
    cover_photo: {type: String, default: ''},
    location: {type: String, default: ''},
    members: [{ type: String, ref: 'User'}],
    admins: [{ type: String, ref: 'User'}]
}, {timestamps: true});

const Group = mongoose.model('Group', groupSchema);

export default Group;