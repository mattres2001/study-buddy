/*******************************************************************************
 * File:        Post.js
 * Description: Mongoose schema and model definition for the Post document,
 *              supporting text, image, and combined post types with like tracking.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    user: { type: String, ref: 'User', required: true },
    content: { type: String },
    image_urls: [{ type: String }],
    post_type: { type: String, enum: ['text', 'image', 'text_with_image'], required: true },
    likes_count: [{ type: String, ref: 'User' }]
}, { timestamps: true, minimize: false }) 

const Post = mongoose.model('Post', postSchema);

export default Post