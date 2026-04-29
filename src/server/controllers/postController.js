/*******************************************************************************
 * File:        postController.js
 * Description: Express controller handling post creation, feed retrieval,
 *              individual post lookup, and like/unlike toggling.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import fs from 'fs'
import imagekit from '../configs/imagekit.js'
import Post from '../models/Post.js'
import User from '../models/User.js'

/*******************************************************************************
 * Function:    addPost
 * Description: Creates a new post for the authenticated user, optionally
 *              uploading images to ImageKit.
 * Input:       req (Express Request) - body: { content, post_type }; files: images
 *              res (Express Response)
 * Output:      New Post document saved to the database
 * Return:      { success: boolean, message: string }
 ******************************************************************************/
export const addPost = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { content, post_type } = req.body;
        const images = req.files;

        let image_urls = [];

        if (images.length) {
            image_urls = await Promise.all(
                images.map(async (image) => {
                    const fileBuffer = fs.readFileSync(image.path);

                    const response = await imagekit.upload({
                        file: fileBuffer,
                        fileName: image.originalname,
                        folder: 'posts'
                    });

                    const url = imagekit.url({
                        path: response.filePath,
                        transformation: [
                            { quality: 'auto' },
                            { format: 'webp' },
                            { width: '1280' }
                        ]
                    });

                    return url;
                })
            );
        }

        await Post.create({
            user: userId,
            content,
            image_urls,
            post_type
        });

        res.json({ success: true, message: "Post created successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

/*******************************************************************************
 * Function:    getFeedPosts
 * Description: Retrieves posts from the authenticated user and their
 *              connections and followings, sorted newest first.
 * Input:       req (Express Request) - authenticated request with Clerk userId
 *              res (Express Response)
 * Output:      JSON response with feed post list
 * Return:      { success: boolean, posts: Post[] }
 ******************************************************************************/
export const getFeedPosts = async (req, res) => {
    try {
        const { userId } = req.auth();
        const user = await User.findById(userId);

        // User connections and followings
        const userIds = [ userId, ...user.connections, ...user.following]
        const posts = await Post.find({ user: { $in: userIds }}).populate('user').sort({ createdAt: -1});

        res.json({ success: true, posts });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

/*******************************************************************************
 * Function:    getPost
 * Description: Retrieves a single post by its ID, including the author's data.
 * Input:       req (Express Request) - params: { postId: string }
 *              res (Express Response)
 * Output:      JSON response with post document
 * Return:      { success: boolean, post: Post }
 ******************************************************************************/
export const getPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Post.findById(postId).populate("user");

        if (!post) {
            return res.json({
                success: false,
                message: "Post not found"
            })
        }

        res.json({ success: true, post })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

/*******************************************************************************
 * Function:    likePost
 * Description: Toggles a like on a post. Adds the user's ID if not liked,
 *              removes it if already liked.
 * Input:       req (Express Request) - body: { postId: string }
 *              res (Express Response)
 * Output:      Updated Post document in the database
 * Return:      { success: boolean, message: string }
 ******************************************************************************/
export const likePost = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { postId } = req.body;

        const post = await Post.findById(postId);

        if (post.likes_count.includes(userId)) {
            post.likes_count = post.likes_count.filter(user => user !== userId);
            await post.save();
            res.json({ success: true, message: 'Post unliked' });
        } else {
            post.likes_count.push(userId);
            await post.save();
            res.json({ success: true, message: 'Post liked' });
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}