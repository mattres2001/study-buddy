/*******************************************************************************
 * File:        Connection.js
 * Description: Mongoose schema and model definition for the Connection document,
 *              tracking pending and accepted connection requests between users.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema({
    from_user_id: { type: String, ref: 'User', required: true},
    to_user_id: { type: String, ref: 'User', required: true},
    status: { type: String, enum: ['pending', 'accepted'], default: 'pending'}
}, {timestamps: true});

const Connection = mongoose.model('Connection', connectionSchema);

export default Connection