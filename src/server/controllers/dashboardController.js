import Group from '../models/Group.js'
import Session from '../models/Session.js'
import User from '../models/User.js'
import Event from '../models/Event.js'

export const getDashboardData = async (req, res) => {
    try {
        const { userId } = req.auth()

        // 1. Get user groups (assuming stored in DB)
        const user = await User.findOne({ _id: userId })

        const groupIds = user.groups || []

        // 2. Fetch groups
        const groups = await Group.find({
            _id: { $in: groupIds }
        })

        // 3. Fetch sessions that belong to those groups
        const sessions = await Session.find({
            groupId: { $in: groupIds }
        }).sort({ started_at: 1 })

        // ✅ Events (only upcoming)
        const now = new Date()

        const events = await Event.find({
            groupId: { $in: groupIds },
            started_at: { $gte: now }
        }).sort({ started_at: 1 })

        return res.json({
            success: true,
            groups,
            sessions,
            events
        })

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}