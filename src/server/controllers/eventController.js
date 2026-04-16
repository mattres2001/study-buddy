import imagekit from '../configs/imagekit.js';
import Event from '../models/Event.js'
import fs from 'fs'
import Group from '../models/Group.js'

export const createEvent = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { 
            title, 
            groupId,
            started_at, 
            ended_at, 
            location, 
            visibility,
            description
        } = req.body;

        // title is required
        if (!title) {
            return res.json({
                success: false,
                message: "Event title is required"
            })
        }

        // group is required
        if (!groupId) {
            return res.json({
                success: false,
                message: "Group is required"
            });
        }
        
        // time must be valid
        if (started_at && ended_at && new Date(ended_at) < new Date(started_at)) {
            return res.json({
                success: false,
                message: "End time cannot be before start time"
            });
        }

        const newEventData = {
            title,
            groupId, 
            started_by: userId,
            started_at,
            ended_at,
            location,
            visibility,
            description
        }

        const picture = req.files.flyer_photo && req.files.flyer_photo[0];

        // Upload event flyer photo
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
            newEventData.flyer_photo = url;
        }

        const newEvent = await Event.create(newEventData);

        res.json({
            success: true,
            newEvent,
            message: "Event created successfully"
        });
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message})
    }
}

export const getEvents = async (req, res) => {
    try {
        const now = new Date();
        const { userId } = req.auth();
        const { groupId } = req.params;
        const events = await Event.find({
            groupId: groupId,

            // visibility rule
            $or: [
                { visibility: 'public' },
                { started_by: userId }
            ],

            // ONLY check if event hasn't ended
            $or: [
                { ended_at: null },
                { ended_at: { $gte: now } }
            ]
        }).sort({ started_at: 1 });


        // console.log("NOW:", now)
        // console.log("Events: ", events)

        res.json({
            success: true,
            events
        })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

export const updateEvent = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { eventId } = req.params

        const event = await Event.findById(eventId)

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            })
        }

        const group = await Group.findById(event.groupId)

        const isCreator = String(event.started_by) === String(userId)
        const isAdmin = group?.admins?.includes(userId)

        if (!isCreator && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Not authorized"
            })
        }

        const {
            title,
            description,
            location,
            started_at,
            ended_at,
            visibility,
            status
        } = req.body


        
        if (started_at && ended_at && new Date(started_at) > new Date(ended_at)) {
            return res.status(400).json({
                success: false,
                message: "Start time must be before end time"
            })
        }

        if (title !== undefined) event.title = title
        if (description !== undefined) event.description = description
        if (location !== undefined) event.location = location
        if (started_at !== undefined) event.started_at = started_at
        if (ended_at !== undefined) event.ended_at = ended_at
        if (visibility !== undefined) event.visibility = visibility
        if (status !== undefined) event.status = status

        await event.save()

        return res.json({
            success: true,
            event
        })

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

export const deleteEvent = async (req, res) => {
    try {
        const { eventId } = req.params

        const event = await Event.findByIdAndDelete(eventId)

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            })
        }

        return res.json({
            success: true,
            message: "Event deleted"
        })

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}