// import { useState } from 'react'
// import { useAuth } from '@clerk/clerk-react'
// import { assets } from '../assets/assets'
// import { Pencil } from 'lucide-react'
// import GroupBarItem from './GroupBarItem'
// import api from '../api/axios'
// import toast from 'react-hot-toast'

// const CreateEventModal = ({ group, groups = [], setShowModal, onCreated, type = 'event' }) => {

//     const { userId, getToken } = useAuth()

//     const [ editForm, setEditForm ] = useState({
//         title: '',
//         groupId: group?._id || '',
//         started_at: Date.now(),
//         ended_at: '',
//         location: '',
//         description: '',

//         // Event Only
//         visibility: 'public',
//         flyer_photo: '',

//         // Session Only
//         participants: [userId],
//         max_participants: 4
//     })

//     const handleSaveEvent = async (e) => {
//         e.preventDefault();

//         const promise = (async () => {
//             const eventData = new FormData();
//             const { 
//                 title, 
//                 groupId,
//                 description, 
//                 flyer_photo, 
//                 started_at, 
//                 ended_at,
//                 location,
//                 visibility,
//                 max_participants
//             } = editForm;

//             eventData.append('title', title);
//             eventData.append('groupId', groupId);
//             eventData.append('description', description);
//             eventData.append('started_at', started_at);
//             eventData.append('ended_at', ended_at);
//             eventData.append('location', location);

//             if (type === "event") {
//                 eventData.append('flyer_photo', flyer_photo);
//                 eventData.append('visibility', visibility);
//             }

//             if (type === "session") {
//                 eventData.append('max_participants', max_participants);
//             }

//             const endpoint = type === "event"
//                 ? "/api/event/create"
//                 : "/api/session/start";
//             const { data } = await api.post(endpoint, eventData, { 
//                 headers: { 
//                     Authorization: `Bearer ${await getToken()}`
//                 } 
//             })

//             return data;
//         })();

//         toast.promise(promise, {
//             loading: 'Saving...',
//             success: (data) => {
//                 if (data.success) {
//                     onCreated(data.newEvent);
//                     setShowModal(false);    
//                     return 'Event created successfully';
//                 }
//                 throw new Error(data.message);
//             },
//             error: (err) => err.message
//         });
//     }

//     return (
//         <div className='fixed top-0 bottom-0 left-0 right-0 z-110 h-screen overflow-y-scroll bg-black/50'>
//             <div className='max-w-2xl sm:py-6 mx-auto'>
//                 <div className='bg-white rounded-lg shadow p-6'>
//                     {/* Title */}
//                     <h1 className='text-2xl font-bold text-gray-900 mb-6'>
//                         {type === "event" ? "Start An Event!" : "Start a Study Session"}
//                     </h1>

//                     {/* Create Group Form */}
//                     <form className='space-y-4' onSubmit={handleSaveEvent}>

//                     {type === "session" && !group && (
//                         <div>
//                             <label className='block text-sm font-medium text-gray-700 mb-3'>
//                                 Select Group
//                             </label>

                            
//                             <div className="flex flex-wrap gap-3">
//                                 {groups.map((g) => (
//                                     <GroupBarItem
//                                         key={g._id}
//                                         group={g}
//                                         isSelected={editForm.groupId === g._id}
//                                         onSelect={(selectedGroup) =>
//                                             setEditForm({
//                                                 ...editForm,
//                                                 groupId: selectedGroup._id
//                                             })
//                                         }
//                                     />
//                                 ))}
//                             </div>
                            
//                         </div>
//                     )}
                        // {/* Flyer Photo */}
                        // {type === "event" && (
                        //     <div className='flex flex-col items-start gap-3'>
                        //         <label htmlFor="flyer_photo" className='block text-sm font-medium text-gray-700'>
                        //             Flyer Photo
                        //         </label>
                        //         <input hidden type="file" accept="image/*" id='flyer_photo' onChange={(e) => setEditForm({...editForm, flyer_photo: e.target.files[0]})}/>
                        //         <div className='group/cover relative cursor-pointer w-full' onClick={() => document.getElementById('flyer_photo').click()}>
                        //             <img src={editForm.flyer_photo ? URL.createObjectURL(editForm.flyer_photo) : assets.sample_cover} alt="Flyer photo" className='w-full h-40 object-cover rounded-lg' />
                        //             <div className='absolute hidden group-hover/cover:flex top-0 left-0 right-0 bottom-0 bg-black/20 rounded-lg items-center justify-center'>
                        //                 <Pencil className='w-5 h-5 text-white' />
                        //             </div>
                        //         </div>
                        //     </div>
                        // )}

//                         {/* Event Title */}
//                         <div>
//                             <label className='block text-sm font-medium text-gray-700 mb-1'>
//                                 {type === "event" ? "Event Title" : "What are we studying?"}
//                             </label>
//                             <input type="text" className='w-full p-3 border border-gray-200 rounded-lg' placeholder='Please enter a title' onChange={(e) => setEditForm({...editForm, title: e.target.value})} value={editForm.title}/>
//                         </div>

//                         {/* Event Description */}
//                         <div>
//                             <label className='block text-sm font-medium text-gray-700 mb-1'>
//                                 Description
//                             </label>
//                             <textarea rows={3} className='w-full p-3 border border-gray-200 rounded-lg' placeholder='Please enter a description' onChange={(e) => setEditForm({...editForm, description: e.target.value})} value={editForm.description}/>
//                         </div>

//                         {/* Event Location */}
//                         <div>
//                             <label className='block text-sm font-medium text-gray-700 mb-1'>
//                                 {type === "event" ? "Event Location" : "Study Spot"}
//                             </label>
//                             <input type="text" className='w-full p-3 border border-gray-200 rounded-lg' placeholder='Please enter a location' onChange={(e) => setEditForm({...editForm, location: e.target.value})} value={editForm.location}/>
//                         </div>

//                         {/* Event Start Time */}
//                         <div>
//                             <label className='block text-sm font-medium text-gray-700 mb-1'>
//                                 {type === "event" ? "Event Start Time" : "Study Session Start Time"}
//                             </label>
//                             <input type="datetime-local" className='w-full p-3 border border-gray-200 rounded-lg'  onChange={(e) => setEditForm({...editForm, started_at: e.target.value})} value={editForm.started_at}/>
//                         </div>

//                         {/* Event End Time */}
//                         <div>
//                             <label className='block text-sm font-medium text-gray-700 mb-1'>
//                                 {type === "event" ? "Event End Time" : "Study Session End Time"}
//                             </label>
//                             <input type="datetime-local" className='w-full p-3 border border-gray-200 rounded-lg'  onChange={(e) => setEditForm({...editForm, ended_at: e.target.value})} value={editForm.ended_at}/>
//                         </div>

//                         {/* Event Visibility */}
//                         {type === "event" && (
//                             <div>
//                                 <label className='block text-sm font-medium text-gray-700 mb-2'>
//                                     Event Visibility
//                                 </label>

//                                 <div className='flex space-x-3'>
//                                     <button
//                                         type="button"
//                                         onClick={() => setEditForm({ ...editForm, visibility: 'public' })}
//                                         className={`px-4 py-2 rounded-lg border transition ${
//                                             editForm.visibility === 'public'
//                                                 ? 'bg-indigo-500 text-white border-indigo-500'
//                                                 : 'bg-white text-gray-700 border-gray-300'
//                                         }`}
//                                     >
//                                         Public
//                                     </button>

//                                     <button
//                                         type="button"
//                                         onClick={() => setEditForm({ ...editForm, visibility: 'private' })}
//                                         className={`px-4 py-2 rounded-lg border transition ${
//                                             editForm.visibility === 'private'
//                                                 ? 'bg-indigo-500 text-white border-indigo-500'
//                                                 : 'bg-white text-gray-700 border-gray-300'
//                                         }`}
//                                     >
//                                         Private
//                                     </button>
//                                 </div>
//                             </div>
//                         )}

//                         {type === "session" && (
//                             <div>
//                                 <label className='block text-sm font-medium text-gray-700 mb-1'>
//                                     Max Participants
//                                 </label>
//                                 <input
//                                     type="number"
//                                     className='w-full p-3 border border-gray-200 rounded-lg'
//                                     placeholder='Enter max participants'
//                                     value={editForm.max_participants}
//                                     onChange={(e) => setEditForm({...editForm, max_participants: e.target.value})}
//                                 />
//                             </div>
//                         )}

                        // {/* Cancel and Save Button */}
                        // <div className='flex justify-end space-x-3 pt-6'>
                        //     <button onClick={() => setShowModal(false)}  type='button' className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer'>Cancel</button>

                        //     <button type='submit' className='px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition cursor-pointer'>Save Changes</button>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default CreateEventModal


import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { assets } from '../assets/assets'
import { Pencil } from 'lucide-react'
import ActivityForm from './ActivityForm'
import api from '../api/axios'
import toast from 'react-hot-toast'

const CreateEventModal = ({ group, groups = [], setShowModal, onCreated }) => {

    const { getToken } = useAuth()

    const [editForm, setEditForm] = useState({
        title: '',
        groupId: group?._id || '',
        started_at: Date.now(),
        ended_at: '',
        location: '',
        description: '',
        visibility: 'public',
        flyer_photo: ''
    })

    const handleSave = async (e) => {
        e.preventDefault();

        if (!editForm.groupId) {
            toast.error("Please select a group");
            return;
        }

        const promise = (async () => {
            const data = new FormData();

            Object.entries(editForm).forEach(([key, value]) => {
                data.append(key, value);
            });

            const res = await api.post('/api/event/create', data, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            });

            return res.data;
        })();

        toast.promise(promise, {
            loading: 'Saving...',
            success: (data) => {
                if (data.success) {
                    onCreated(data.newEvent);
                    setShowModal(false);
                    return 'Event created!';
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
                    <h1 className='text-2xl font-bold text-gray-900 mb-6'>Start An Event!</h1>

                    <form className='space-y-4' onSubmit={handleSave}>

                        {/* Flyer */}
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

                        <ActivityForm
                            editForm={editForm}
                            setEditForm={setEditForm}
                            group={group}
                            groups={groups}
                            type="event"
                        />

                        {/* End */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                End Time
                            </label>
                            <input
                                type="datetime-local"
                                className='w-full p-3 border border-gray-200 rounded-lg'
                                value={editForm.ended_at}
                                onChange={(e) => setEditForm({ ...editForm, ended_at: e.target.value })}
                            />
                        </div>

                        {/* Visibility */}
                        <div className='block gap-3'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Visibility
                            </label>
                            {['public', 'private'].map(v => (
                                <button
                                    key={v}
                                    type="button"
                                    onClick={() => setEditForm({ ...editForm, visibility: v })}
                                    className={`px-4 py-2 border rounded-lg ${editForm.visibility === v && 'bg-indigo-500 text-white'}`}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>

                        {/* <div className='flex justify-end gap-3'>
                            <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                            <button type="submit">Create Event</button>
                        </div> */}

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