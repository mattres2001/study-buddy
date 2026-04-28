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
 * Function:    updateGroup
 * Description: Updates an existing group's data (not yet implemented).
 * Input:       req (Express Request), res (Express Response)
 * Output:      Updated Group document
 * Return:      { success: boolean, group: Group, message: string }
 ******************************************************************************/
export const updateGroup = async (req, res) => {

}

/*******************************************************************************
 * Function:    deleteGroup
 * Description: Deletes a group by ID (not yet implemented).
 * Input:       req (Express Request), res (Express Response)
 * Output:      Group document removed from database
 * Return:      { success: boolean, message: string }
 ******************************************************************************/
export const deleteGroup = async (req, res) => {

}

/*******************************************************************************
 * Function:    addGroupMember
 * Description: Adds a user to an existing group's members list (not yet
 *              implemented).
 * Input:       req (Express Request), res (Express Response)
 * Output:      Updated Group document with new member
 * Return:      { success: boolean, message: string }
 ******************************************************************************/
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
