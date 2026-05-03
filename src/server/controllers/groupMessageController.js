/*******************************************************************************
 * File:        groupMessageController.js
 * Description: Express controller for group chat — sending messages to a group
 *              and retrieving group message history. Broadcasts new messages to
 *              all connected group members via the shared SSE connections map.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import fs from 'fs'
import imagekit from '../configs/imagekit.js'
import GroupMessage from '../models/GroupMessage.js'
import Group from '../models/Group.js'
import { connections } from './messageController.js'

/*******************************************************************************
 * Function:    sendGroupMessage
 * Description: Saves a new message to a group's chat. Verifies the sender is a
 *              group member, optionally uploads an image to ImageKit, then
 *              broadcasts the message to all connected members via SSE.
 * Input:       req (Express Request) - body: { group_id, text }; file: image
 *              res (Express Response)
 * Output:      Message saved; SSE event pushed to all connected group members
 * Return:      { success: boolean, message: GroupMessage }
 ******************************************************************************/
export const sendGroupMessage = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { group_id, text } = req.body;
        const image = req.file;

        const group = await Group.findById(group_id);
        if (!group) return res.json({ success: false, message: 'Group not found' });
        if (!group.members.includes(userId)) {
            return res.json({ success: false, message: 'You are not a member of this group' });
        }

        let media_url = '';
        let message_type = image ? 'image' : 'text';

        if (message_type === 'image') {
            const fileBuffer = fs.readFileSync(image.path);
            const response = await imagekit.upload({
                file: fileBuffer,
                fileName: image.originalname
            });
            media_url = imagekit.url({
                path: response.filePath,
                transformation: [
                    { quality: 'auto' },
                    { format: 'webp' },
                    { width: '1280' }
                ]
            });
        }

        const message = await GroupMessage.create({
            group_id,
            from_user_id: userId,
            text,
            message_type,
            media_url
        });

        res.json({ success: true, message });

        // Broadcast to all connected group members via existing per-user SSE streams
        const payload = `data: ${JSON.stringify(message)}\n\n`;
        for (const memberId of group.members) {
            if (connections[memberId]) connections[memberId].write(payload);
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

/*******************************************************************************
 * Function:    getGroupMessages
 * Description: Retrieves all messages for a group, sorted oldest-first, with
 *              from_user_id populated. Verifies caller is a group member.
 * Input:       req (Express Request) - body: { group_id: string }
 *              res (Express Response)
 * Output:      JSON response with populated message list
 * Return:      { success: boolean, messages: GroupMessage[] }
 ******************************************************************************/
export const getGroupMessages = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { group_id } = req.body;

        const group = await Group.findById(group_id);
        if (!group) return res.json({ success: false, message: 'Group not found' });
        if (!group.members.includes(userId)) {
            return res.json({ success: false, message: 'You are not a member of this group' });
        }

        const messages = await GroupMessage.find({ group_id })
            .populate('from_user_id', 'full_name username profile_picture')
            .sort({ createdAt: 1 });

        res.json({ success: true, messages });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
