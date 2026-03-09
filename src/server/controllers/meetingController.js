import mongoose from 'mongoose';
import Meeting from '../models/Meeting'

export const startMeeting = async (req, res) => {
    try {

        const { userId } = req.auth(); // get userID of meeting creator
        const { groupId, participants, location, description } = req.body; // frontend has to pass _id, participants, location of meeting

        const newMeetingData = {
            _id: new mongoose.Types.ObjectId().toString(),
            group: groupId,
            started_by: userId,
            participants: participants,
            description: description,
            location: location
        }

        const newMeeting = await Meeting.create(newMeetingData);

        res.json({
            success: true,
            meeting: newMeeting,
            message: "Meeting created successfully"
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export const endMeeting = async (req, res) => {
    try {
        const { meetingId } = req.body;

        const meeting = await Meeting.findByIdAndUpdate(
            meetingId, 
            { ended_at: new Date() },
            {new: true}
        );

        if (!meeting) {
            return res.json({ success: false, message: "Meeting not found" });
        }

        res.json({
            success: true,
            meeting,
            message: "Meeting ended successfuly"
        })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}