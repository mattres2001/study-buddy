/*******************************************************************************
 * File:        messageController.js
 * Description: Express controller handling real-time messaging via Server-Sent
 *              Events (SSE), message sending, chat history retrieval, and
 *              recent message summaries.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import fs from 'fs'
import imagekit from '../configs/imagekit.js'
import Message from '../models/Message.js'

// Create an empty object to story SS Event connections
const connections = {};

/*******************************************************************************
 * Function:    sseController
 * Description: Opens a persistent Server-Sent Events connection for the given
 *              userId and registers the response object so the server can push
 *              real-time messages. Cleans up on client disconnect.
 * Input:       req (Express Request) - params: { userId: string }
 *              res (Express Response) - kept open as an SSE stream
 * Output:      Long-lived SSE connection; events pushed on incoming messages
 * Return:      void
 ******************************************************************************/
export const sseController = (req, res) => {
    const { userId } = req.params;
    console.log('New client connected : ', userId);

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Controll-Allow-Origin', '*');

    // Add the client's response object to the connections object
    connections[userId] = res;

    // Send an initial event to the client
    res.write('log: Connected to SSE stream\n\n');

    // Handle client disconnection
    req.on('close', () => {
        // Remove the client's response object from the connection array
        delete connections[userId];
        console.log('Client disconnected');
    })
}

/*******************************************************************************
 * Function:    sendMessage
 * Description: Saves a new message to the database. Optionally uploads an image
 *              to ImageKit, then pushes the message to the recipient's SSE
 *              stream if they are connected.
 * Input:       req (Express Request) - body: { to_user_id, text }; file: image
 *              res (Express Response)
 * Output:      Message saved; SSE event pushed to recipient if online
 * Return:      { success: boolean, message: Message }
 ******************************************************************************/
export const sendMessage = async (req, res) => {
    try {
        console.log('Heree')
        const { userId } = req.auth();
        const { to_user_id, text } = req.body;
        const image = req.file;

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

        const message = await Message.create({
            from_user_id: userId,
            to_user_id,
            text,
            message_type,
            media_url
        });

        res.json({ success: true, message });

        // Send message to to_user_id using SSE
        const messageWithUserData = await Message.findById(message._id).populate('from_user_id');

        if (connections[to_user_id]) {
            connections[to_user_id].write(`data: ${JSON.stringify(messageWithUserData)}\n\n`);
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

/*******************************************************************************
 * Function:    getChatMessages
 * Description: Retrieves all messages exchanged between the authenticated user
 *              and another user, then marks received messages as seen.
 * Input:       req (Express Request) - body: { to_user_id: string }
 *              res (Express Response)
 * Output:      JSON response with message list; received messages marked seen
 * Return:      { success: boolean, messages: Message[] }
 ******************************************************************************/
export const getChatMessages = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { to_user_id } = req.body; 

        const messages = await Message.find({
            $or: [
                { from_user_id: userId, to_user_id },
                { from_user_id: to_user_id, to_user_id: userId}
            ]
        }).sort({ created_at: -1 });

        // mark messages as seen
        await Message.updateMany({ from_user_id: to_user_id, to_user_id: userId}, { seen: true });

        res.json({ success: true, messages });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

/*******************************************************************************
 * Function:    getUserRecentMessages
 * Description: Retrieves all messages received by the authenticated user,
 *              populated with sender and recipient data, sorted newest first.
 * Input:       req (Express Request) - authenticated request with Clerk userId
 *              res (Express Response)
 * Output:      JSON response with recent message list
 * Return:      { success: boolean, messages: Message[] }
 ******************************************************************************/
export const getUserRecentMessages = async (req, res) => {
    try {
        const { userId } = req.auth();
        const messages = await Message.find({ to_user_id: userId }).populate('from_user_id to_user_id').sort({ created_at: -1 });

        res.json({ success: true, messages });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}