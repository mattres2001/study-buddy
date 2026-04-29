/*******************************************************************************
 * File:        Group.js
 * Description: Mongoose schema and model definition for the Group document,
 *              representing study groups with members, admins, and metadata.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
    _id: { type: String, required: true},
    name: { type: String, required: true, unique: true},
    subject: { type: String, required: true },
    school: { type: String, default: '' },
    description: { type: String, default: ''},
    group_picture: {type: String, default: ''},
    cover_photo: {type: String, default: ''},
    location: {type: String, default: ''},
    members: [{ type: String, ref: 'User'}],
    admins: [{ type: String, ref: 'User'}],
    joinRequests: [{ type: String, ref: 'User'}]
}, {timestamps: true});

const Group = mongoose.model('Group', groupSchema);

export default Group;