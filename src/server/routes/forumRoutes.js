/*******************************************************************************
 * File:        forumRoutes.js
 * Description: Express router defining all /api/forum endpoints for subforum
 *              management, post creation/retrieval, comments, and upvotes.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import express from 'express'
import {
    getSubforums,
    createSubforum,
    getSubforum,
    createPost,
    getPost,
    createComment,
    upvotePost,
    upvoteComment
} from '../controllers/forumController.js'
import { protect } from '../middleware/auth.js'

const forumRouter = express.Router();

forumRouter.get('/subforums',               protect, getSubforums);
forumRouter.post('/subforums',              protect, createSubforum);
forumRouter.get('/subforums/:subforumId',   protect, getSubforum);
forumRouter.post('/subforums/:subforumId/post', protect, createPost);
forumRouter.get('/post/:postId',            protect, getPost);
forumRouter.post('/post/:postId/comment',   protect, createComment);
forumRouter.post('/post/:postId/upvote',    protect, upvotePost);
forumRouter.post('/comment/:commentId/upvote', protect, upvoteComment);

export default forumRouter;
