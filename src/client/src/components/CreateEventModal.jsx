import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { assets } from '../assets/assets'
import { Pencil } from 'lucide-react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const CreateEventModal = ({ group, setShowModal, onEventCreated }) => {

    const { userId, getToken } = useAuth()

    const [ editForm, setEditForm ] = useState({
        title: '',
        group: group._id,
        started_at: Date.now(),
        ended_at: '',
        location: '',
        visibility: 'public',
        flyer_photo: '',
        description: ''
    })

    const handleSaveEvent = async (e) => {
        e.preventDefault();

        const promise = (async () => {
            const eventData = new FormData();
            const { 
                title, 
                group,
                description, 
                flyer_photo, 
                started_at, 
                ended_at,
                location,
                visibility
            } = editForm;

            eventData.append('title', title);
            eventData.append('group', group);
            eventData.append('description', description);
            eventData.append('flyer_photo', flyer_photo);
            eventData.append('started_at', started_at);
            eventData.append('ended_at', ended_at);
            eventData.append('location', location);
            eventData.append('visibility', visibility);

            const { data } = await api.post('/api/event/create', eventData, { 
                headers: { 
                    Authorization: `Bearer ${await getToken()}`
                } 
            })

            return data;
        })();

        toast.promise(promise, {
            loading: 'Saving...',
            success: (data) => {
                if (data.success) {
                    onEventCreated(data.newEvent);
                    setShowModal(false);    
                    return 'Event created successfully';
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
                    {/* Title */}
                    <h1 className='text-2xl font-bold text-gray-900 mb-6'>Start An Event!</h1>

                    {/* Create Group Form */}
                    <form className='space-y-4' onSubmit={handleSaveEvent}>

                        {/* Flyer Photo */}
                        <div className='flex flex-col items-start gap-3'>
                            <label htmlFor="flyer_photo" className='block text-sm font-medium text-gray-700'>
                                Flyer Photo
                            </label>
                            <input hidden type="file" accept="image/*" id='flyer_photo' onChange={(e) => setEditForm({...editForm, flyer_photo: e.target.files[0]})}/>
                            <div className='group/cover relative cursor-pointer w-full' onClick={() => document.getElementById('flyer_photo').click()}>
                                <img src={editForm.flyer_photo ? URL.createObjectURL(editForm.flyer_photo) : assets.sample_cover} alt="Flyer photo" className='w-full h-40 object-cover rounded-lg' />
                                <div className='absolute hidden group-hover/cover:flex top-0 left-0 right-0 bottom-0 bg-black/20 rounded-lg items-center justify-center'>
                                    <Pencil className='w-5 h-5 text-white' />
                                </div>
                            </div>
                        </div>

                        {/* Event Title */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Event Title
                            </label>
                            <input type="text" className='w-full p-3 border border-gray-200 rounded-lg' placeholder='Please enter an event title' onChange={(e) => setEditForm({...editForm, title: e.target.value})} value={editForm.title}/>
                        </div>

                        {/* Event Description */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Description
                            </label>
                            <textarea rows={3} className='w-full p-3 border border-gray-200 rounded-lg' placeholder='Please enter a description' onChange={(e) => setEditForm({...editForm, description: e.target.value})} value={editForm.description}/>
                        </div>

                        {/* Event Location */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Event Location
                            </label>
                            <input type="text" className='w-full p-3 border border-gray-200 rounded-lg' placeholder='Please enter a location' onChange={(e) => setEditForm({...editForm, location: e.target.value})} value={editForm.location}/>
                        </div>

                        {/* Event Start Time */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Event Start
                            </label>
                            <input type="datetime-local" className='w-full p-3 border border-gray-200 rounded-lg'  onChange={(e) => setEditForm({...editForm, started_at: e.target.value})} value={editForm.started_at}/>
                        </div>

                        {/* Event End Time */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Event End
                            </label>
                            <input type="datetime-local" className='w-full p-3 border border-gray-200 rounded-lg'  onChange={(e) => setEditForm({...editForm, ended_at: e.target.value})} value={editForm.ended_at}/>
                        </div>

                        {/* Event Visibility */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                Event Visibility
                            </label>

                            <div className='flex space-x-3'>
                                <button
                                    type="button"
                                    onClick={() => setEditForm({ ...editForm, visibility: 'public' })}
                                    className={`px-4 py-2 rounded-lg border transition ${
                                        editForm.visibility === 'public'
                                            ? 'bg-indigo-500 text-white border-indigo-500'
                                            : 'bg-white text-gray-700 border-gray-300'
                                    }`}
                                >
                                    Public
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setEditForm({ ...editForm, visibility: 'private' })}
                                    className={`px-4 py-2 rounded-lg border transition ${
                                        editForm.visibility === 'private'
                                            ? 'bg-indigo-500 text-white border-indigo-500'
                                            : 'bg-white text-gray-700 border-gray-300'
                                    }`}
                                >
                                    Private
                                </button>
                            </div>
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

export default CreateEventModal
