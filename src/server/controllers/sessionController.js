import mongoose from 'mongoose';
import Session from '../models/Session.js'

export const startSession = async (req, res) => {
    try {

        const { userId } = req.auth(); // get userID of session creator
        const { 
            groupId, 
            title, 
            participants, 
            location, 
            description, 
            started_at, 
            ended_at,
            max_participants,
            duration_hours,
            vibe
        } = req.body; // frontend has to pass _id, participants, location of meeting

        const durationMs = duration_hours * 60 * 60 * 1000;

        const newSessionData = {
            _id: new mongoose.Types.ObjectId().toString(),
            title: title,
            groupId: groupId,
            started_by: userId,
            started_at: started_at,
            ended_at: new Date(new Date(started_at).getTime() + durationMs),
            participants: participants,
            description: description,
            location: location,
            max_participants: max_participants,
            duration_hours: duration_hours,
            vibe: vibe
        }

        const newSession = await Session.create(newSessionData);

        res.json({
            success: true,
            session: newSession,
            message: "Session created successfully"
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}   

export const updateSessionVibe = async (req, res) => {
    try {
        const { sessionId } = req.params
        const { vibe, emoji } = req.body

        const session = await Session.findByIdAndUpdate(
            sessionId,
            {
                vibe: { vibe, emoji }
            },
            { new: true }
        )

        res.json({
            success: true,
            session
        })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// export const endSession = async (req, res) => {
//     try {
//         const { sessionId } = req.body;

//         const session = await Session.findByIdAndUpdate(
//             sessionId, 
//             { ended_at: new Date() },
//             {new: true}
//         );

//         if (!session) {
//             return res.json({ success: false, message: "Session not found" });
//         }

//         res.json({
//             success: true,
//             session,
//             message: "Session ended successfuly"
//         })

//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message });
//     }
// }

export const joinSession = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { sessionId } = req.params

        const session = await Session.findById(sessionId)

        if (!session) {
            return res.json({ success: false, message: "Session not found" })
        }

        // prevent joining ended sessions
        if (session.ended_at && new Date(session.ended_at) < new Date()) {
            return res.json({ success: false, message: "Session already ended" })
        }

        // prevent duplicate joins
        if (session.participants.includes(userId)) {
            return res.json({ success: false, message: "Already joined" })
        }

        session.participants.push(userId)
        await session.save()

        res.json({
            success: true,
            message: "Joined session successfully",
            session
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export const endSession = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { sessionId } = req.params

        const session = await Session.findById(sessionId)

        if (!session) {
            return res.json({ success: false, message: "Session not found" })
        }

        // check admin permission
        const isAdmin = session.started_by === userId

        if (!isAdmin) {
            return res.json({ success: false, message: "Not authorized" })
        }

        // already ended check
        if (session.ended_at && new Date(session.ended_at) < new Date()) {
            return res.json({ success: false, message: "Session already ended" })
        }

        session.ended_at = new Date()
        await session.save()

        res.json({
            success: true,
            message: "Session ended successfully",
            session
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export const getGroupSessions = async (req, res) => {
    try {
        const now = new Date();
        const { groupId } = req.params;

        const sessions = await Session.find({
            groupId: groupId,
            // Only sessions that haven't ended
            $or: [
                { ended_at: { $gte: now } },
                { ended_at: null }
            ]
        }).sort({ started_at: 1 });

        res.json({
            success: true,
            sessions
        })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

export const getUpcomingGroupSessions = async (req, res) => {
    try {
        const now = new Date()
        const { groupId } = req.params

        const sessions = await Session.find({
            groupId: groupId,
            started_at: { $gt: now },   // 🔥 not started yet
            $or: [
                { ended_at: { $gte: now } },
                { ended_at: null }
            ]
        }).sort({ started_at: 1 })

        res.json({
            success: true,
            sessions
        })

    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
    }
}