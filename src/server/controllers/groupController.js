import mongoose from 'mongoose';
import Group from "../models/Group.js";
import User from "../models/User.js";
import imagekit from '../configs/imagekit.js';
import fs from 'fs';

// Most likely going to need for each method: const { userID } = req.auth()



//create group and make creator admin
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


export const getGroupData = async (req, res) => {

    //make sure to find the correct group by its ID.
    try {
        const { groupID } = req.auth();
        const group = await Group.findById(groupID);
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

export const updateGroup = async (req, res) => {
    
}

export const deleteGroup = async (req, res) => {
    
}

export const addGroupMember = async (req, res) => {
    
}

export const removeMember = async (req, res) => {
    
}

export const getMyGroups = async (req, res) => {
    
}
