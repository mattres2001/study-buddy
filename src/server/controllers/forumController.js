/*******************************************************************************
 * File:        forumController.js
 * Description: Express controller handling all forum operations: subforum
 *              creation and listing, post creation/retrieval, comment creation,
 *              and upvote toggling for posts and comments.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import Subforum from '../models/Subforum.js'
import ForumPost from '../models/ForumPost.js'
import ForumComment from '../models/ForumComment.js'

/*******************************************************************************
 * Function:    getSubforums
 * Description: Returns all subforums sorted by name, each annotated with its
 *              post count.
 * Input:       req (Express Request) - authenticated
 *              res (Express Response)
 * Return:      { success: boolean, subforums: Subforum[] }
 ******************************************************************************/
export const getSubforums = async (req, res) => {
    try {
        const subforums = await Subforum.find().sort({ name: 1 });

        const withCounts = await Promise.all(
            subforums.map(async (sf) => {
                const count = await ForumPost.countDocuments({ subforum_id: sf._id });
                return { ...sf.toObject(), post_count: count };
            })
        );

        res.json({ success: true, subforums: withCounts });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

/*******************************************************************************
 * Function:    createSubforum
 * Description: Creates a new subforum for a specific class. Requires a unique
 *              name and a class_name.
 * Input:       req (Express Request) - body: { name, class_name, school, description }
 *              res (Express Response)
 * Return:      { success: boolean, subforum: Subforum }
 ******************************************************************************/
export const createSubforum = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { name, class_name, school, description } = req.body;

        if (!name || !class_name) {
            return res.json({ success: false, message: 'Name and class name are required' });
        }

        const existing = await Subforum.findOne({ name });
        if (existing) {
            return res.json({ success: false, message: 'A subforum with this name already exists' });
        }

        const subforum = await Subforum.create({ name, class_name, school, description, created_by: userId });
        res.json({ success: true, subforum });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

/*******************************************************************************
 * Function:    getSubforum
 * Description: Returns a single subforum by ID along with its posts (sorted
 *              newest-first), each annotated with comment count and author info.
 * Input:       req (Express Request) - params: { subforumId }
 *              res (Express Response)
 * Return:      { success: boolean, subforum: Subforum, posts: ForumPost[] }
 ******************************************************************************/
export const getSubforum = async (req, res) => {
    try {
        const { subforumId } = req.params;

        const subforum = await Subforum.findById(subforumId);
        if (!subforum) return res.json({ success: false, message: 'Subforum not found' });

        const posts = await ForumPost.find({ subforum_id: subforumId })
            .populate('author_id', 'full_name username profile_picture')
            .sort({ createdAt: -1 });

        const postsWithCounts = await Promise.all(
            posts.map(async (post) => {
                const comment_count = await ForumComment.countDocuments({ post_id: post._id });
                return { ...post.toObject(), comment_count };
            })
        );

        res.json({ success: true, subforum, posts: postsWithCounts });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

/*******************************************************************************
 * Function:    createPost
 * Description: Creates a new post in the given subforum.
 * Input:       req (Express Request) - params: { subforumId }; body: { title, body }
 *              res (Express Response)
 * Return:      { success: boolean, post: ForumPost }
 ******************************************************************************/
export const createPost = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { subforumId } = req.params;
        const { title, body } = req.body;

        if (!title) return res.json({ success: false, message: 'Title is required' });

        const subforum = await Subforum.findById(subforumId);
        if (!subforum) return res.json({ success: false, message: 'Subforum not found' });

        const post = await ForumPost.create({ subforum_id: subforumId, author_id: userId, title, body });
        const populated = await post.populate('author_id', 'full_name username profile_picture');
        res.json({ success: true, post: populated });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

/*******************************************************************************
 * Function:    getPost
 * Description: Returns a single post by ID with its author populated and all
 *              comments (sorted oldest-first) with their authors populated.
 * Input:       req (Express Request) - params: { postId }
 *              res (Express Response)
 * Return:      { success: boolean, post: ForumPost, comments: ForumComment[] }
 ******************************************************************************/
export const getPost = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await ForumPost.findById(postId)
            .populate('author_id', 'full_name username profile_picture');
        if (!post) return res.json({ success: false, message: 'Post not found' });

        const comments = await ForumComment.find({ post_id: postId })
            .populate('author_id', 'full_name username profile_picture')
            .sort({ createdAt: 1 });

        res.json({ success: true, post, comments });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

/*******************************************************************************
 * Function:    createComment
 * Description: Adds a comment to an existing post.
 * Input:       req (Express Request) - params: { postId }; body: { body }
 *              res (Express Response)
 * Return:      { success: boolean, comment: ForumComment }
 ******************************************************************************/
export const createComment = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { postId } = req.params;
        const { body } = req.body;

        if (!body) return res.json({ success: false, message: 'Comment cannot be empty' });

        const post = await ForumPost.findById(postId);
        if (!post) return res.json({ success: false, message: 'Post not found' });

        const comment = await ForumComment.create({ post_id: postId, author_id: userId, body });
        const populated = await comment.populate('author_id', 'full_name username profile_picture');
        res.json({ success: true, comment: populated });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

/*******************************************************************************
 * Function:    upvotePost
 * Description: Toggles the authenticated user's upvote on a post (adds if not
 *              present, removes if already present).
 * Input:       req (Express Request) - params: { postId }
 *              res (Express Response)
 * Return:      { success: boolean, upvotes: string[] }
 ******************************************************************************/
export const upvotePost = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { postId } = req.params;

        const post = await ForumPost.findById(postId);
        if (!post) return res.json({ success: false, message: 'Post not found' });

        const hasUpvoted = post.upvotes.includes(userId);
        if (hasUpvoted) {
            post.upvotes.pull(userId);
        } else {
            post.upvotes.push(userId);
        }
        await post.save();
        res.json({ success: true, upvotes: post.upvotes });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

/*******************************************************************************
 * Function:    upvoteComment
 * Description: Toggles the authenticated user's upvote on a comment.
 * Input:       req (Express Request) - params: { commentId }
 *              res (Express Response)
 * Return:      { success: boolean, upvotes: string[] }
 ******************************************************************************/
export const upvoteComment = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { commentId } = req.params;

        const comment = await ForumComment.findById(commentId);
        if (!comment) return res.json({ success: false, message: 'Comment not found' });

        const hasUpvoted = comment.upvotes.includes(userId);
        if (hasUpvoted) {
            comment.upvotes.pull(userId);
        } else {
            comment.upvotes.push(userId);
        }
        await comment.save();
        res.json({ success: true, upvotes: comment.upvotes });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
