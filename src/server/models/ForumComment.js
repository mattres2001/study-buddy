/*******************************************************************************
 * File:        ForumComment.js
 * Description: Mongoose schema and model for a ForumComment document,
 *              representing a reply to a forum post.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import mongoose from 'mongoose';

const forumCommentSchema = new mongoose.Schema({
    post_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'ForumPost', required: true },
    author_id: { type: String, ref: 'User', required: true },
    body:      { type: String, required: true },
    upvotes:   [{ type: String, ref: 'User' }]
}, { timestamps: true });

const ForumComment = mongoose.model('ForumComment', forumCommentSchema);

export default ForumComment;
