/*******************************************************************************
 * File:        ForumPost.js
 * Description: Mongoose schema and model for a ForumPost document, representing
 *              a thread posted within a subforum.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import mongoose from 'mongoose';

const forumPostSchema = new mongoose.Schema({
    subforum_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subforum', required: true },
    author_id:   { type: String, ref: 'User', required: true },
    title:       { type: String, required: true },
    body:        { type: String, default: '' },
    upvotes:     [{ type: String, ref: 'User' }]
}, { timestamps: true });

const ForumPost = mongoose.model('ForumPost', forumPostSchema);

export default ForumPost;
