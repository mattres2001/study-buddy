/*******************************************************************************
 * File:        GroupMessage.js
 * Description: Mongoose schema and model definition for GroupMessage documents,
 *              representing messages sent within a study group chat.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import mongoose from 'mongoose';

const groupMessageSchema = new mongoose.Schema({
    group_id:     { type: String, ref: 'Group', required: true },
    from_user_id: { type: String, ref: 'User',  required: true },
    text:         { type: String, default: '' },
    message_type: { type: String, enum: ['text', 'image'], default: 'text' },
    media_url:    { type: String, default: '' }
}, { timestamps: true });

const GroupMessage = mongoose.model('GroupMessage', groupMessageSchema);

export default GroupMessage;
