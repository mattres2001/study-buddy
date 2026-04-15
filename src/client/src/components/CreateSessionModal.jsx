import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import ActivityForm from './ActivityForm'
import api from '../api/axios'
import toast from 'react-hot-toast'

const CreateSessionModal = ({ group, groups = [], setShowModal, onCreated }) => {

    const { userId, getToken } = useAuth()

    const [editForm, setEditForm] = useState({
        title: '',
        groupId: group?._id || '',
        started_at: Date.now(),
        ended_at: '',
        location: '',
        description: '',
        max_participants: 4,
        duration_hours: 1
    })

    const handleSave = async (e) => {
        e.preventDefault();

        if (!editForm.groupId) {
            toast.error("Please select a group");
            return;
        }

        const promise = (async () => {
            const payload = {
                ...editForm,
                participants: [userId]
            };

            const res = await api.post('/api/session/start', payload, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            });

            return res.data;
        })();

        toast.promise(promise, {
            loading: 'Saving...',
            success: (data) => {
                if (data.success) {
                    console.log('CreateSessionModal:', data.session)
                    onCreated(data.session)
                    setShowModal(false);
                    return 'Session created!';
                }
                throw new Error(data.message);
            },
            error: (err) => err.message
        });
    }

    return (
        <div className='fixed top-0 bottom-0 left-0 right-0 z-110 h-screen overflow-y-scroll bg-black/50'>
            <div className='max-w-2xl sm:py-6 mx-auto'>
                <div className='bg-white rounded-lg shadow p-6'>
                    <h1 className='text-2xl font-bold text-gray-900 mb-6'>Start a Study Session</h1>

                    <form className='space-y-4' onSubmit={handleSave}>

                        <ActivityForm
                            editForm={editForm}
                            setEditForm={setEditForm}
                            group={group}
                            groups={groups}
                            type="session"
                        />

                    
                        <div className="mt-3">
                            <label className="text-sm font-medium text-gray-600">
                                Session vibe (optional)
                            </label>

                            <input
                                type="text"
                                placeholder="e.g. focused grind, chill study, exam prep..."
                                value={editForm.vibe || ""}
                                onChange={(e) =>
                                    setEditForm(prev => ({
                                        ...prev,
                                        vibe: e.target.value
                                    }))
                                }
                                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md text-sm"
                            />
                        </div>

                        {/* Session Duration */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">
                                Session Duration (hours)
                            </label>

                            <input
                                type="number"
                                min={0}
                                value={editForm.duration_hours}
                                onChange={(e) =>
                                setEditForm({
                                    ...editForm,
                                    duration_hours: Number(e.target.value) || 0,
                                })
                                }
                                className="w-full p-3 border border-gray-200 rounded-lg"
                                placeholder="Enter duration in hours"
                            />
                        </div>

                        {/* Max Participants */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">
                                Max Participants
                            </label>
                            <input
                                type="number"
                                value={editForm.max_participants}
                                onChange={(e) =>
                                    setEditForm({ ...editForm, max_participants: e.target.value })
                                }
                                className='w-full p-3 border border-gray-200 rounded-lg'
                            />
                        </div>

                        {/* Cancel and Save Button */}
                        <div className='flex justify-end space-x-3 pt-6'>
                            <button onClick={() => setShowModal(false)}  type='button' className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer'>Cancel</button>

                            <button type='submit' className='px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition cursor-pointer'>Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CreateSessionModal