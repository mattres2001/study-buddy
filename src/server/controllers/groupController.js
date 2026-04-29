/*******************************************************************************
 * File:        groupController.js
 * Description: Express controller handling group creation, retrieval, updates,
 *              deletion, and member management for study groups.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import mongoose from 'mongoose';
import Group from "../models/Group.js";
import User from "../models/User.js";
import imagekit from '../configs/imagekit.js';
import fs from 'fs';

// Most likely going to need for each method: const { userID } = req.auth()



/*******************************************************************************
 * Function:    createGroup
 * Description: Creates a new study group with the authenticated user as the
 *              initial admin and member. Optionally uploads a group picture and
 *              cover photo to ImageKit, then links the group to the user's profile.
 * Input:       req (Express Request) - body: { name, description, location };
 *                  files: { group_picture, cover_photo }
 *              res (Express Response)
 * Output:      New Group document saved; user's groups array updated
 * Return:      { success: boolean, group: Group, message: string }
 ******************************************************************************/
export const createGroup = async (req, res) => {
    console.log("AUTH OBJECT:", req.auth);
    try {

        const { userId } = req.auth(); // get userID of group creator
        const { name, description, location } = req.body; // frontend has to pass name and description of group
        
        if (!name) {
            return res.json({
                success: false,
                message: "Group name is required"
            })
        }

        // logic to find if a group by name exists, if so 
        const existingGroup = await Group.findOne({ name: name})
        if (existingGroup) {
            return res.json({
                success: false,
                message: "A group with this name already exists"
            })
        }

        const admins = [userId];
        const members = [userId];

        // generate a string ID (schema requires it) instead of relying on mongoose auto-ObjectId
        const newGroupData = {
            _id: new mongoose.Types.ObjectId().toString(),
            name,
            description,
            location,
            members,
            admins
        }

        const picture = req.files.group_picture && req.files.group_picture[0];
        const cover = req.files.cover_photo && req.files.cover_photo[0];

        // Upload group profile picture
        if (picture) {
            const buffer = fs.readFileSync(picture.path);
            const response = await imagekit.upload({
                file: buffer,
                fileName: picture.originalname,
            });

            const url = imagekit.url({
                path: response.filePath,
                transformation: [
                    { quality: 'auto' },
                    { format: 'webp' },
                    { width: '512' }
                ]
            });
            newGroupData.group_picture = url;
        }

        // Upload group cover photo
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
            newGroupData.cover_photo = url;
        }

        // Create new group in database
        const newGroup = await Group.create(newGroupData)

        // Add group to User's profile
        await User.updateOne(
            { _id: userId }, 
            { $addToSet: { groups: newGroup._id } }
        );

        res.json({
            success: true,
            group: newGroup,
            message: "Group created successfully"
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}


/*******************************************************************************
 * Function:    getGroupData
 * Description: Retrieves a group's data by ID, including populated member
 *              profile information.
 * Input:       req (Express Request) - params: { groupId: string }
 *              res (Express Response)
 * Output:      JSON response with group document and member details
 * Return:      { success: boolean, group: Group }
 ******************************************************************************/
export const getGroupData = async (req, res) => {

    //make sure to find the correct group by its ID.
    try {
        const { groupId } = req.params;
        const group = await Group.findById(groupId).populate('members', 'full_name username profile_picture');
        if (!group) {
            return res.json({
                success: false,
                message: "Group not found"
            });
        }
        res.json({
            success: true,
            group
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
    
}

/*******************************************************************************
 * Function:    searchGroups
 * Description: Searches for groups matching a query string against name,
 *              description, subject, and location fields.
 * Input:       req (Express Request) - body: { input: string }
 *              res (Express Response)
 * Output:      JSON response with matched group documents
 * Return:      { success: boolean, groups: Group[] }
 ******************************************************************************/
export const searchGroups = async (req, res) => {
    try {
        const { input } = req.body
        if (!input?.trim()) return res.json({ success: true, groups: [] })

        const regex = new RegExp(input.trim(), 'i')
        const groups = await Group.find({
            $or: [
                { name: regex },
                { description: regex },
                { subject: regex },
                { location: regex }
            ]
        }).limit(20)

        res.json({ success: true, groups })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

/*******************************************************************************
 * Function:    updateGroup
 * Description: Updates an existing group's data (not yet implemented).
 * Input:       req (Express Request), res (Express Response)
 * Output:      Updated Group document
 * Return:      { success: boolean, group: Group, message: string }
 ******************************************************************************/
export const updateGroup = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { groupId } = req.params
        const { name, description, subject, school, location } = req.body

        const group = await Group.findById(groupId)
        if (!group) return res.status(404).json({ success: false, message: 'Group not found' })
        if (!group.admins.includes(userId))
            return res.status(403).json({ success: false, message: 'Not authorized' })

        if (name !== undefined) group.name = name
        if (description !== undefined) group.description = description
        if (subject !== undefined) group.subject = subject
        if (school !== undefined) group.school = school
        if (location !== undefined) group.location = location

        const picture = req.files?.group_picture?.[0]
        const cover   = req.files?.cover_photo?.[0]

        if (picture) {
            const buffer = fs.readFileSync(picture.path)
            const response = await imagekit.upload({ file: buffer, fileName: picture.originalname })
            group.group_picture = imagekit.url({
                path: response.filePath,
                transformation: [{ quality: 'auto' }, { format: 'webp' }, { width: '512' }]
            })
        }

        if (cover) {
            const buffer = fs.readFileSync(cover.path)
            const response = await imagekit.upload({ file: buffer, fileName: cover.originalname })
            group.cover_photo = imagekit.url({
                path: response.filePath,
                transformation: [{ quality: 'auto' }, { format: 'webp' }, { width: '1280' }]
            })
        }

        await group.save()
        res.json({ success: true, group, message: 'Group updated successfully' })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

/*******************************************************************************
 * Function:    deleteGroup
 * Description: Deletes a group by ID (not yet implemented).
 * Input:       req (Express Request), res (Express Response)
 * Output:      Group document removed from database
 * Return:      { success: boolean, message: string }
 ******************************************************************************/
export const deleteGroup = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { groupId } = req.params

        const group = await Group.findById(groupId)
        if (!group) return res.status(404).json({ success: false, message: 'Group not found' })
        if (!group.admins.includes(userId))
            return res.status(403).json({ success: false, message: 'Not authorized' })

        await User.updateMany({ groups: groupId }, { $pull: { groups: groupId } })
        await Group.deleteOne({ _id: groupId })

        res.json({ success: true, message: 'Group deleted successfully' })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

/*******************************************************************************
 * Function:    addGroupMember
 * Description: Adds a user to an existing group's members list (not yet
 *              implemented).
 * Input:       req (Express Request), res (Express Response)
 * Output:      Updated Group document with new member
 * Return:      { success: boolean, message: string }
 ******************************************************************************/
/*******************************************************************************
 * Function:    leaveGroup
 * Description: Removes the authenticated user from a group's members and admin
 *              lists, and pulls the group from their profile. Blocks the action
 *              if the user is the sole admin with other members still present.
 * Input:       req (Express Request) - params: { groupId }
 *              res (Express Response)
 * Output:      Group and User documents updated
 * Return:      { success: boolean, message: string }
 ******************************************************************************/
export const leaveGroup = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { groupId } = req.params

        const group = await Group.findById(groupId)
        if (!group) return res.status(404).json({ success: false, message: 'Group not found' })

        if (!group.members.includes(userId))
            return res.json({ success: false, message: 'You are not a member of this group' })

        const isSoleAdmin = group.admins.includes(userId) && group.admins.length === 1
        if (isSoleAdmin && group.members.length > 1)
            return res.json({ success: false, message: 'Assign another admin before leaving' })

        group.members = group.members.filter(id => id !== userId)
        group.admins  = group.admins.filter(id => id !== userId)
        await group.save()

        await User.updateOne({ _id: userId }, { $pull: { groups: groupId } })

        res.json({ success: true, message: 'You have left the group' })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

export const addGroupMember = async (req, res) => {

}

/*******************************************************************************
 * Function:    removeMember
 * Description: Removes a user from an existing group's members list (not yet
 *              implemented).
 * Input:       req (Express Request), res (Express Response)
 * Output:      Updated Group document with member removed
 * Return:      { success: boolean, message: string }
 ******************************************************************************/
export const removeMember = async (req, res) => {

}

/*******************************************************************************
 * Function:    getMyGroups
 * Description: Retrieves all groups the authenticated user belongs to (not yet
 *              implemented).
 * Input:       req (Express Request) - authenticated request with Clerk userId
 *              res (Express Response)
 * Output:      JSON response with list of user's groups
 * Return:      { success: boolean, groups: Group[] }
 ******************************************************************************/
export const getMyGroups = async (req, res) => {

}

/*******************************************************************************
 * Function:    requestJoin
 * Description: Adds the authenticated user to a group's joinRequests list.
 *              Rejects if the user is already a member or has a pending request.
 * Input:       req (Express Request) - params: { groupId }
 *              res (Express Response)
 * Output:      Updated Group document
 * Return:      { success: boolean, message: string }
 ******************************************************************************/
export const requestJoin = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { groupId } = req.params

        const group = await Group.findById(groupId)
        if (!group) return res.status(404).json({ success: false, message: 'Group not found' })

        if (group.members.includes(userId))
            return res.json({ success: false, message: 'Already a member' })

        if (group.joinRequests.includes(userId))
            return res.json({ success: false, message: 'Request already pending' })

        group.joinRequests.push(userId)
        await group.save()

        res.json({ success: true, message: 'Join request sent' })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

/*******************************************************************************
 * Function:    getJoinRequests
 * Description: Returns pending join requests for a group, with user profile
 *              data populated. Admin-only.
 * Input:       req (Express Request) - params: { groupId }
 *              res (Express Response)
 * Output:      JSON response with populated requester list
 * Return:      { success: boolean, requests: User[] }
 ******************************************************************************/
export const getJoinRequests = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { groupId } = req.params

        const group = await Group.findById(groupId)
        if (!group) return res.status(404).json({ success: false, message: 'Group not found' })

        if (!group.admins.includes(userId))
            return res.status(403).json({ success: false, message: 'Not authorized' })

        const requests = await User.find(
            { _id: { $in: group.joinRequests } },
            { _id: 1, full_name: 1, username: 1, profile_picture: 1 }
        )

        res.json({ success: true, requests })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

/*******************************************************************************
 * Function:    handleJoinRequest
 * Description: Approves or denies a pending join request. Admin-only.
 *              On approval, adds the user to members and their groups list.
 * Input:       req (Express Request) - params: { groupId, requestUserId };
 *                  body: { action: 'approve' | 'deny' }
 *              res (Express Response)
 * Output:      Updated Group document
 * Return:      { success: boolean, message: string }
 ******************************************************************************/
export const handleJoinRequest = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { groupId, requestUserId } = req.params
        const { action } = req.body

        const group = await Group.findById(groupId)
        if (!group) return res.status(404).json({ success: false, message: 'Group not found' })

        if (!group.admins.includes(userId))
            return res.status(403).json({ success: false, message: 'Not authorized' })

        group.joinRequests = group.joinRequests.filter(id => id !== requestUserId)

        if (action === 'approve') {
            if (!group.members.includes(requestUserId)) {
                group.members.push(requestUserId)
            }
            await User.updateOne(
                { _id: requestUserId },
                { $addToSet: { groups: groupId } }
            )
        }

        await group.save()

        res.json({
            success: true,
            message: action === 'approve' ? 'User approved' : 'Request denied'
        })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}
