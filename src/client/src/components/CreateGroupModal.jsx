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
import { useDispatch } from 'react-redux'
import { Pencil } from 'lucide-react'
import { assets } from '../assets/assets.js'
import { toast } from 'react-hot-toast'
import api from '../api/axios'
import { fetchUser } from '../features/user/userSlice'

/*******************************************************************************
 * Function:    CreateGroupModal
 * Description: Renders a modal form for creating a new study group with name,
 *              subject, school, description, location, and optional image
 *              uploads. Refreshes the user's group list in Redux on success.
 * Input:       setShowModal (function) - controls modal visibility
 * Output:      New group created via API; Redux user state refreshed
 * Return:      JSX.Element
 ******************************************************************************/
const CreateGroupModal = ({ setShowModal }) => {

    const { getToken } = useAuth()
    const dispatch = useDispatch()

    const [form, setForm] = useState({
        name:          '',
        subject:       '',
        school:        '',
        description:   '',
        location:      '',
        group_picture: null,
        cover_photo:   null,
    })

    const set     = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))
    const setFile = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.files[0] }))

    /*******************************************************************************
     * Function:    handleSubmit
     * Description: Builds a FormData payload and POSTs to create a new group.
     *              Refreshes the authenticated user's Redux state on success so
     *              the GroupBar updates immediately.
     * Input:       e (Event) - form submit event
     * Output:      New group saved; user's groups list refreshed in Redux
     * Return:      void
     ******************************************************************************/
    const handleSubmit = async (e) => {
        e.preventDefault()

        const promise = (async () => {
            const fd = new FormData()
            fd.append('name',        form.name)
            fd.append('subject',     form.subject)
            fd.append('school',      form.school)
            fd.append('description', form.description)
            fd.append('location',    form.location)
            if (form.group_picture) fd.append('group_picture', form.group_picture)
            if (form.cover_photo)   fd.append('cover_photo',   form.cover_photo)

            const token = await getToken()
            const { data } = await api.post('/api/group/create', fd, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            })
            if (!data.success) throw new Error(data.message)
            return token
        })()

        toast.promise(promise, {
            loading: 'Creating group...',
            success: (token) => {
                dispatch(fetchUser(token))
                setShowModal(false)
                return 'Group created!'
            },
            error: (err) => err.message
        })
    }

    const coverSrc   = form.cover_photo   ? URL.createObjectURL(form.cover_photo)   : assets.sample_cover
    const pictureSrc = form.group_picture ? URL.createObjectURL(form.group_picture) : assets.sample_profile

    return (
        <div className='fixed top-0 bottom-0 left-0 right-0 z-110 h-screen overflow-y-scroll bg-black/50'>
            <div className='max-w-2xl sm:py-6 mx-auto'>
                <div className='bg-white rounded-lg shadow p-6'>
                    <h1 className='text-2xl font-bold text-gray-900 mb-6'>Create a Study Group</h1>

                    <form className='space-y-4' onSubmit={handleSubmit}>

                        {/* Cover Photo */}
                        <div className='flex flex-col items-start gap-3'>
                            <label htmlFor='create_cover' className='block text-sm font-medium text-gray-700'>
                                Cover Photo
                            </label>
                            <input hidden type='file' accept='image/*' id='create_cover' onChange={setFile('cover_photo')} />
                            <div className='group/cover relative cursor-pointer w-full' onClick={() => document.getElementById('create_cover').click()}>
                                <img src={coverSrc} alt='Cover photo' className='w-full h-40 object-cover rounded-lg' />
                                <div className='absolute hidden group-hover/cover:flex top-0 left-0 right-0 bottom-0 bg-black/20 rounded-lg items-center justify-center'>
                                    <Pencil className='w-5 h-5 text-white' />
                                </div>
                            </div>
                        </div>

                        {/* Group Picture */}
                        <div className='flex flex-col items-start gap-3'>
                            <label htmlFor='create_picture' className='block text-sm font-medium text-gray-700'>
                                Group Picture
                            </label>
                            <input hidden type='file' accept='image/*' id='create_picture' onChange={setFile('group_picture')} />
                            <div className='group/profile relative cursor-pointer' onClick={() => document.getElementById('create_picture').click()}>
                                <img src={pictureSrc} alt='Group picture' className='w-24 h-24 rounded-full object-cover' />
                                <div className='absolute hidden group-hover/profile:flex top-0 left-0 right-0 bottom-0 bg-black/20 rounded-full items-center justify-center'>
                                    <Pencil className='w-5 h-5 text-white' />
                                </div>
                            </div>
                        </div>

                        {/* Group Name */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Group Name <span className='text-red-400'>*</span></label>
                            <input required type='text' className='w-full p-3 border border-gray-200 rounded-lg' placeholder='e.g. Thursday Night CS Study' value={form.name} onChange={set('name')} />
                        </div>

                        {/* Subject */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Subject <span className='text-red-400'>*</span></label>
                            <input required type='text' className='w-full p-3 border border-gray-200 rounded-lg' placeholder='e.g. Computer Science' value={form.subject} onChange={set('subject')} />
                        </div>

                        {/* School */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>School</label>
                            <input type='text' className='w-full p-3 border border-gray-200 rounded-lg' placeholder='e.g. UCLA' value={form.school} onChange={set('school')} />
                        </div>

                        {/* Description */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Description</label>
                            <textarea rows={3} className='w-full p-3 border border-gray-200 rounded-lg' placeholder='What is this group for?' value={form.description} onChange={set('description')} />
                        </div>

                        {/* Location */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Location</label>
                            <input type='text' className='w-full p-3 border border-gray-200 rounded-lg' placeholder='e.g. Powell Library, Room 302' value={form.location} onChange={set('location')} />
                        </div>

                        <div className='flex justify-end space-x-3 pt-6'>
                            <button type='button' onClick={() => setShowModal(false)} className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer'>
                                Cancel
                            </button>
                            <button type='submit' className='px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition cursor-pointer'>
                                Create Group
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CreateGroupModal
