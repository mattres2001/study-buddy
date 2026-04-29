/*******************************************************************************
 * File:        sessionController.js
 * Description: Express controller handling study session lifecycle: creation,
 *              joining, ending, vibe updates, description edits, and retrieval
 *              of current and upcoming group sessions.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import mongoose from 'mongoose'
import Session from '../models/Session.js'
import User from '../models/User.js'

/*******************************************************************************
 * Function:    startSession
 * Description: Creates a new study session for a group, calculating the end
 *              time from the given duration in hours.
 * Input:       req (Express Request) - body: { groupId, title, participants,
 *                  location, description, started_at, ended_at,
 *                  max_participants, duration_hours, vibe }
 *              res (Express Response)
 * Output:      New Session document saved to the database
 * Return:      { success: boolean, session: Session, message: string }
 ******************************************************************************/
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

/*******************************************************************************
 * Function:    updateSessionVibe
 * Description: Updates the vibe (text and emoji) of an existing session.
 * Input:       req (Express Request) - params: { sessionId }; body: { text, emoji }
 *              res (Express Response)
 * Output:      Updated Session document
 * Return:      { success: boolean, session: Session }
 ******************************************************************************/
export const updateSessionVibe = async (req, res) => {
    try {
        const { sessionId } = req.params
        const { text, emoji } = req.body

        const session = await Session.findByIdAndUpdate(
            sessionId,
            {
                vibe: { text, emoji }
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

/*******************************************************************************
 * Function:    joinSession
 * Description: Adds the authenticated user to a session's participants list.
 *              Rejects if the session has ended or the user already joined.
 * Input:       req (Express Request) - params: { sessionId }
 *              res (Express Response)
 * Output:      Updated Session document with new participant
 * Return:      { success: boolean, message: string, session: Session }
 ******************************************************************************/
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

/*******************************************************************************
 * Function:    endSession
 * Description: Ends an active session by setting ended_at to the current time.
 *              Only the session creator is authorized to end it.
 * Input:       req (Express Request) - params: { sessionId }
 *              res (Express Response)
 * Output:      Updated Session document with ended_at timestamp
 * Return:      { success: boolean, message: string, session: Session }
 ******************************************************************************/
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

/*******************************************************************************
 * Function:    getGroupSessions
 * Description: Retrieves all active (not yet ended) sessions for a given group,
 *              sorted by start time ascending.
 * Input:       req (Express Request) - params: { groupId: string }
 *              res (Express Response)
 * Output:      JSON response with active session list
 * Return:      { success: boolean, sessions: Session[] }
 ******************************************************************************/
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

/*******************************************************************************
 * Function:    getUpcomingGroupSessions
 * Description: Retrieves sessions for a group that have not yet started,
 *              sorted by start time ascending.
 * Input:       req (Express Request) - params: { groupId: string }
 *              res (Express Response)
 * Output:      JSON response with upcoming session list
 * Return:      { success: boolean, sessions: Session[] }
 ******************************************************************************/
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

/*******************************************************************************
 * Function:    updateDescription
 * Description: Updates the description field of an existing session.
 * Input:       req (Express Request) - params: { sessionId }; body: { description }
 *              res (Express Response)
 * Output:      Updated Session document
 * Return:      { success: boolean, session: Session }
 ******************************************************************************/
export const updateDescription = async (req, res) => {
    try {
        const { sessionId } = req.params
        const { description } = req.body

        const session = await Session.findById(sessionId)

        if (!session) {
            return res.status(404).json({ success: false })
        }

        session.description = description
        await session.save()

        res.json({ success: true, session })

    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

/*******************************************************************************
 * Function:    getActiveSessionsByGroup
 * Description: Returns active/starting-soon sessions for all of the user's
 *              groups, keyed by groupId, so the sidebar can show live status
 *              and hover tooltips.
 * Input:       req (Express Request) - authenticated request with Clerk userId
 *              res (Express Response)
 * Output:      JSON response with sessions grouped by groupId
 * Return:      { success: boolean, sessionsByGroup: Record<string, Session[]> }
 ******************************************************************************/
export const getActiveSessionsByGroup = async (req, res) => {
    try {
        const { userId } = req.auth()
        const user = await User.findById(userId, { groups: 1 })
        if (!user?.groups?.length) return res.json({ success: true, sessionsByGroup: {} })

        const now = new Date()
        const fiveMinFromNow = new Date(now.getTime() + 5 * 60 * 1000)

        const activeSessions = await Session.find(
            {
                groupId: { $in: user.groups },
                started_at: { $lte: fiveMinFromNow },
                ended_at: { $gte: now }
            },
            { groupId: 1, title: 1, started_at: 1, ended_at: 1 }
        )

        const sessionsByGroup = {}
        for (const s of activeSessions) {
            if (!sessionsByGroup[s.groupId]) sessionsByGroup[s.groupId] = []
            sessionsByGroup[s.groupId].push(s)
        }

        res.json({ success: true, sessionsByGroup })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}


