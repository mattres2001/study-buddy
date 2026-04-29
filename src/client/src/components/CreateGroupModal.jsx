/*******************************************************************************
 * File:        CreateGroupModal.jsx
 * Description: Modal component for creating a new study group, including
 *              group picture and cover photo upload, and API submission.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import React, { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Pencil, Paperclip } from 'lucide-react'
import { assets } from '../assets/assets.js'
import { toast } from 'react-hot-toast'
import api from '../api/axios' // axios instance with baseURL

/*******************************************************************************
 * Function:    CreateGroupModal
 * Description: Renders a modal form for creating a new study group with name,
 *              description, subject, location, and optional image uploads.
 * Input:       setShowModal (function) - controls modal visibility
 * Output:      New group created via API; modal closed on success
 * Return:      JSX.Element
 ******************************************************************************/
const CreateGroupModal = ({setShowModal}) => {

    const { userId, getToken } = useAuth()

    // Create group form state
    const [ editForm, setEditForm ] = useState({
        name: '',
        description: '',
        group_picture: null,
        cover_photo: null,
        location: '',
        members: [userId],
        admins: [userId]
    })

    const handleSaveGroup = async (e) => {
        e.preventDefault();

        const promise = (async () => {
            const groupData = new FormData();
            const { name, description, group_picture, cover_photo, location } = editForm;

            groupData.append('name', name);
            groupData.append('description', description);
            groupData.append('location', location);

            if (group_picture) groupData.append('group_picture', group_picture);
            if (cover_photo) groupData.append('cover_photo', cover_photo);

            const token = await getToken();
            // use shared axios instance for request
            const { data } = await api.post('/api/group/create', groupData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            return data;
        })();

        toast.promise(promise, {
            loading: 'Saving...',
            success: (data) => {
                if (data.success) {
                    setShowModal(false);
                    return 'Group created successfully';
                }
                throw new Error(data.message);
            },
            error: (err) => err.message
        });
    };  

    return (
        <div className='fixed top-0 bottom-0 left-0 right-0 z-110 h-screen overflow-y-scroll bg-black/50'>
            <div className='max-w-2xl sm:py-6 mx-auto'>
                <div className='bg-white rounded-lg shadow p-6'>
                    {/* Title */}
                    <h1 className='text-2xl font-bold text-gray-900 mb-6'>Create a Study Group</h1>

                    {/* Create Group Form */}
                    <form className='space-y-4' onSubmit={handleSaveGroup}>

                        {/* Group Photo */}
                        <div className='flex flex-col items-start gap-3'>
                            <label htmlFor="group_picture" className='block text-sm font-medium text-gray-700'>
                                Group Picture
                            </label>
                            <input hidden type="file" accept="image/*" id='group_picture' onChange={(e) => setEditForm({...editForm, group_picture: e.target.files[0]})}/>
                            <div className='group/profile relative cursor-pointer' onClick={() => document.getElementById('group_picture').click()}>
                                <img src={editForm.group_picture ? URL.createObjectURL(editForm.group_picture) : assets.sample_profile} alt="Group picture" className='w-24 h-24 rounded-full object-cover' />
                                <div className='absolute hidden group-hover/profile:flex top-0 left-0 right-0 bottom-0 bg-black/20 rounded-full items-center justify-center'>
                                    <Pencil className='w-5 h-5 text-white' />
                                </div>
                            </div>
                        </div>

                        {/* Cover Photo */}
                        <div className='flex flex-col items-start gap-3'>
                            <label htmlFor="cover_photo" className='block text-sm font-medium text-gray-700'>
                                Cover Photo
                            </label>
                            <input hidden type="file" accept="image/*" id='cover_photo' onChange={(e) => setEditForm({...editForm, cover_photo: e.target.files[0]})}/>
                            <div className='group/cover relative cursor-pointer w-full' onClick={() => document.getElementById('cover_photo').click()}>
                                <img src={editForm.cover_photo ? URL.createObjectURL(editForm.cover_photo) : assets.sample_cover} alt="Cover photo" className='w-full h-40 object-cover rounded-lg' />
                                <div className='absolute hidden group-hover/cover:flex top-0 left-0 right-0 bottom-0 bg-black/20 rounded-lg items-center justify-center'>
                                    <Pencil className='w-5 h-5 text-white' />
                                </div>
                            </div>
                        </div>

                        {/* Group Name */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Group Name
                            </label>
                            <input type="text" className='w-full p-3 border border-gray-200 rounded-lg' placeholder='Please enter a group name' onChange={(e) => setEditForm({...editForm, name: e.target.value})} value={editForm.name}/>
                        </div>

                        {/* Group Description */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Description
                            </label>
                            <textarea rows={3} className='w-full p-3 border border-gray-200 rounded-lg' placeholder='Please enter a short description' onChange={(e) => setEditForm({...editForm, description: e.target.value})} value={editForm.description}/>
                        </div>

                        {/* Group Location */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Location
                            </label>
                            <input type="text" className='w-full p-3 border border-gray-200 rounded-lg' placeholder='Please enter your location' onChange={(e) => setEditForm({...editForm, location: e.target.value})} value={editForm.location}/>
                        </div>

                        {/* Cancel and Save Button */}
                        <div className='flex justify-end space-x-3 pt-6'>
                            <button onClick={() => setShowModal(false)}  type='button' className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer'>Cancel</button>

                            <button type='submit' className='px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition cursor-pointer'>Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CreateGroupModal
