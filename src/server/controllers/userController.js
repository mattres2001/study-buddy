/*******************************************************************************
 * File:        userController.js
 * Description: Express controller handling all user-related API operations
 *              including profile retrieval, updates, follow/unfollow, connection
 *              requests, and user discovery/recommendations.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import imagekit from '../configs/imagekit.js'
import User from '../models/User.js'
import fs from 'fs'
import Connection from '../models/Connection.js'
import Post from '../models/Post.js'
import { inngest } from '../inngest/index.js'
import { clerkClient } from '@clerk/express'

/*******************************************************************************
 * Function:    getUserData
 * Description: Retrieves the authenticated user's profile, including populated
 *              group references.
 * Input:       req (Express Request) - authenticated request with Clerk userId
 *              res (Express Response)
 * Output:      JSON response with user document
 * Return:      { success: boolean, user: User }
 ******************************************************************************/
export const getUserData = async (req, res) => {
    try {
        const { userId } = req.auth();
        
        const user = await User.findById(userId).populate({
            path: 'groups',
            select: 'name group_picture cover_photo'
        });

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }
        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}


/*******************************************************************************
 * Function:    updateUserData
 * Description: Updates the authenticated user's profile fields and optionally
 *              uploads new profile or cover images to ImageKit.
 * Input:       req (Express Request) - body: username, bio, location, full_name,
 *                  courses, subjects; files: profile, cover
 *              res (Express Response)
 * Output:      JSON response with updated user document
 * Return:      { success: boolean, user: User, message: string }
 ******************************************************************************/
export const updateUserData = async (req, res) => {
    try {
        const { userId } = req.auth();
        let { username, bio, location, full_name, courses, subjects } = req.body;

        const tempUser = await User.findById(userId);

        !username && (username = tempUser.username);

        if (tempUser.username !== username) {
            const user = await User.findOne({username});
            if (user) {
                // we will not change username if it is already taken
                username = tempUser.username;
            }
        }

        const updatedData = {
            username,
            bio,
            location,
            full_name,
            courses: courses ? JSON.parse(courses) : [],
            subjects: subjects ? JSON.parse(subjects) : []
        };

        const profile = req.files.profile && req.files.profile[0];
        const cover = req.files.cover && req.files.cover[0];

        if (profile) {
            const buffer = fs.readFileSync(profile.path);
            const response = await imagekit.upload({
                file: buffer,
                fileName: profile.originalname,
            });

            const url = imagekit.url({
                path: response.filePath,
                transformation: [
                    { quality: 'auto' },
                    { format: 'webp' },
                    { width: '512' }
                ]
            });
            updatedData.profile_picture = url;
        }

        if (cover) {
            const buffer = fs.readFileSync(cover.path);
            const response = await imagekit.upload({
                file: buffer,
                fileName: cover.originalname,
            });

            const url = imagekit.url({
                path: response.filePath,
                transformation: [
                    { quality: 'auto' },
                    { format: 'webp' },
                    { width: '1280' }
                ]
            });
            updatedData.cover_photo = url;
        }

        const user = await User.findByIdAndUpdate(userId, updatedData, { new: true })

        res.json({ 
            success: true, 
            user, 
            message: "Profile updated successfully "
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

/*******************************************************************************
 * Function:    discoverUsers
 * Description: Searches for users matching a query string against username,
 *              email, full name, and location fields (case-insensitive).
 * Input:       req (Express Request) - body: { input: string }
 *              res (Express Response)
 * Output:      JSON response with matching user documents
 * Return:      { success: boolean, users: User[] }
 ******************************************************************************/
export const discoverUsers = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { input } = req.body;

        const allUsers = await User.find(
            {
                $or: [
                    { username: new RegExp(input, 'i') },
                    { email: new RegExp(input, 'i') },
                    { full_name: new RegExp(input, 'i') },
                    { location: new RegExp(input, 'i') }
                ]
            }
        );
        const filteredUsers = allUsers.filter(user => user._id !== userId);
        
        res.json({ success: true, users: filteredUsers });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

/*******************************************************************************
 * Function:    followUser
 * Description: Adds the target user to the authenticated user's following list
 *              and adds the authenticated user to the target's followers list.
 * Input:       req (Express Request) - body: { id: string } (target user id)
 *              res (Express Response)
 * Output:      JSON response confirming the follow action
 * Return:      { success: boolean, message: string }
 ******************************************************************************/
export const followUser = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.body;

        const user = await User.findById(userId);

        if (user.following.includes(id)) {
            return res.json({ success: false, message: 'You are already following this user' });
        }

        user.following.push(id);
        await user.save();

        const toUser = await User.findById(id);
        toUser.followers.push(userId);
        await toUser.save();

        res.json({ success: true, message: 'Now you are following this user' })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

/*******************************************************************************
 * Function:    unfollowUser
 * Description: Removes the target user from the authenticated user's following
 *              list and removes the authenticated user from the target's
 *              following list.
 * Input:       req (Express Request) - body: { id: string } (target user id)
 *              res (Express Response)
 * Output:      JSON response confirming the unfollow action
 * Return:      { success: boolean, message: string }
 ******************************************************************************/
export const unfollowUser = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.body;

        const user = await User.findById(userId);

        user.following = user.following.filter(user => user !== id);
        await user.save();

        const toUser = await User.findById(id);
        toUser.following = toUser.following.filter(user => user !== userId);
        await toUser.save();

        res.json({ success: true, message: 'You are no longer following this user' })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

/*******************************************************************************
 * Function:    sendConnectionRequest
 * Description: Creates a pending Connection document between two users and
 *              triggers an Inngest event for email notification. Enforces a
 *              rate limit of 20 requests per 24 hours.
 * Input:       req (Express Request) - body: { id: string } (target user id)
 *              res (Express Response)
 * Output:      JSON response and Inngest event dispatched
 * Return:      { success: boolean, message: string }
 ******************************************************************************/
export const sendConnectionRequest = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.body;

        // Check if user has sent more than 20 connection requests in the last 24 hours
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const connectionRequests = await Connection.find({
            from_user_id: userId,
            created_at: { $gt: last24Hours }
        });
        if (connectionRequests.length >= 20) {
            return res.json({ success: false, message: 'You have sent more than 20 connection requests in the last 24 hours' });
        }

        // Check if users are already connected
        const connection = await Connection.findOne({
            $or: [
                { from_user_id: userId, to_user_id: id},
                { from_user_id: id, to_user_id: userId}
            ]
        });

        if (!connection) {
            const newConnection = await Connection.create({
                from_user_id: userId,
                to_user_id: id
            });

            await inngest.send({
                name: 'app/connection-request',
                data: { connectionId: newConnection._id}
            });

            return res.json({ success: true, message: 'Connection request sent successfully' });
        } else if (connection && connection.status === 'accepted') {
            return res.json({ success: false, message: 'You are already connected with this user' });
        }

        return res.json({ success: false, message: 'Connection request pending' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

/*******************************************************************************
 * Function:    getUserConnections
 * Description: Retrieves the authenticated user's connections, followers,
 *              following list, and incoming pending connection requests.
 * Input:       req (Express Request) - authenticated request with Clerk userId
 *              res (Express Response)
 * Output:      JSON response with connection data arrays
 * Return:      { success: boolean, connections, followers, following,
 *               pendingConnections }
 ******************************************************************************/
export const getUserConnections = async (req, res) => {
    try {
        const { userId } = req.auth();
        const user = await User.findById(userId).populate('connections followers following');

        const connections = user.connections;
        const followers = user.followers;
        const following = user.following;

        const pendingConnections = (await Connection.find({ 
            to_user_id: userId,
            status: 'pending'
        }).populate('from_user_id')).map(connection => connection.from_user_id)

        res.json({
            success: true,
            connections,
            followers,
            following,
            pendingConnections
        });
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

/*******************************************************************************
 * Function:    acceptConnectionRequest
 * Description: Accepts a pending connection request by updating both users'
 *              connections arrays and setting the Connection status to accepted.
 * Input:       req (Express Request) - body: { id: string } (requesting user id)
 *              res (Express Response)
 * Output:      JSON response confirming acceptance
 * Return:      { success: boolean, message: string }
 ******************************************************************************/
export const acceptConnectionRequest = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.body;

        const connection = await Connection.findOne({ 
            from_user_id: id,
            to_user_id: userId
        });

        if (!connection) {
            return res.json({ success: false, message: 'Connection not found' });
        }

        const user = await User.findById(userId);
        user.connections.push(id);
        await user.save();

        const toUser = await User.findById(id);
        toUser.connections.push(userId);
        await toUser.save();
        
        connection.status = 'accepted';
        await connection.save();

        res.json({ success: true, message: 'Connection accepted successfully' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

/*******************************************************************************
 * Function:    getUserProfiles
 * Description: Retrieves a user's public profile, their posts, and group
 *              memberships by profile ID.
 * Input:       req (Express Request) - body: { profileId: string }
 *              res (Express Response)
 * Output:      JSON response with profile, posts, and groups
 * Return:      { success: boolean, profile: User, posts: Post[], groups: Group[] }
 ******************************************************************************/
export const getUserProfiles = async (req, res) => {
    try {
        const { profileId } = req.body;
        const profile = await User.findById(profileId).populate({
            path: 'groups',
            select: 'name group_picture cover_photo'
        });

        if (!profile) {
            return res.json({ success: false, message: 'Profile not found' });
        }

        const posts = await Post.find({ user: profileId }).populate('user');
        res.json({ success: true, profile, posts, groups: profile.groups || [] });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

/*******************************************************************************
 * Function:    getRecommendedUsers
 * Description: Scores and ranks non-connected users by shared courses, subjects,
 *              and mutual connections, returning the top 10 recommendations.
 * Input:       req (Express Request) - authenticated request with Clerk userId
 *              res (Express Response)
 * Output:      JSON response with scored recommendation list
 * Return:      { success: boolean, recommendations: Array<{ user, score,
 *               sharedCourses, sharedSubjects, mutualConnectionsCount }> }
 ******************************************************************************/
export const getRecommendedUsers = async (req, res) => {
    try {
        const { userId } = req.auth();

        const currentUser = await User.findById(userId)
            .populate('connections', '_id');

        if (!currentUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const currentConnections = currentUser.connections.map(c => c._id.toString());

        // Exclude self + existing connections
        const excludedIds = [...currentConnections, userId];

        const users = await User.find({
            _id: { $nin: excludedIds }
        });

        const scoredUsers = users.map(user => {
            let score = 0;

            // 🔹 Shared courses
            const sharedCourses = user.courses.filter(course =>
                currentUser.courses.includes(course)
            );
            score += sharedCourses.length * 3;

            // 🔹 Shared subjects
            const sharedSubjects = user.subjects.filter(subject =>
                currentUser.subjects.includes(subject)
            );
            score += sharedSubjects.length * 2;

            // 🔹 Mutual connections
            const mutualConnections = user.connections.filter(conn =>
                currentConnections.includes(conn.toString())
            );
            score += mutualConnections.length * 4;

            return {
                user,
                score,
                sharedCourses,
                sharedSubjects,
                mutualConnectionsCount: mutualConnections.length
            };
        });

        // Sort by highest score
        const sortedUsers = scoredUsers
            .filter(u => u.score > 0) // optional: remove irrelevant users
            .sort((a, b) => b.score - a.score)
            .slice(0, 10); // limit results

        res.json({
            success: true,
            recommendations: sortedUsers
        });

    } catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};