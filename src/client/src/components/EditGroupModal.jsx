/*******************************************************************************
 * File:        EditGroupModal.jsx
 * Description: Admin-only modal for editing a study group's profile fields and
 *              images, with an inline Danger Zone section to delete the group.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Pencil } from 'lucide-react'
import { assets } from '../assets/assets.js'
import toast from 'react-hot-toast'
import api from '../api/axios'

/*******************************************************************************
 * Function:    EditGroupModal
 * Description: Renders a scrollable modal form pre-filled with the group's
 *              current data. Admins can update text fields and images, or
 *              permanently delete the group via the Danger Zone section.
 * Input:       group (object)      - current group document from the API
 *              onClose (function)  - closes the modal without saving
 *              onUpdated (function)- called with the updated group on save
 *              onDeleted (function)- called after successful group deletion
 * Output:      PUT /api/group/:id on save; DELETE /api/group/:id on delete
 * Return:      JSX.Element
 ******************************************************************************/
const EditGroupModal = ({ group, onClose, onUpdated, onDeleted }) => {
    const { getToken } = useAuth()
    const [form, setForm] = useState({
        name:          group.name        || '',
        description:   group.description || '',
        subject:       group.subject     || '',
        school:        group.school      || '',
        location:      group.location    || '',
        group_picture: null,
        cover_photo:   null,
    })
    const [confirmDelete, setConfirmDelete] = useState(false)

    const set     = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))
    const setFile = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.files[0] }))

    /*******************************************************************************
     * Function:    handleSubmit
     * Description: Builds a FormData payload from the form state and sends a PUT
     *              request to update the group. Calls onUpdated and onClose on
     *              success; surfaces errors via toast.
     * Input:       e (Event) - form submit event
     * Output:      Group document updated in the database
     * Return:      void
     ******************************************************************************/
    const handleSubmit = async (e) => {
        e.preventDefault()
        const promise = (async () => {
            const fd = new FormData()
            fd.append('name',        form.name)
            fd.append('description', form.description)
            fd.append('subject',     form.subject)
            fd.append('school',      form.school)
            fd.append('location',    form.location)
            if (form.group_picture) fd.append('group_picture', form.group_picture)
            if (form.cover_photo)   fd.append('cover_photo',   form.cover_photo)

            const token = await getToken()
            const { data } = await api.put(`/api/group/${group._id}`, fd, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            })
            if (!data.success) throw new Error(data.message)
            return data
        })()

        toast.promise(promise, {
            loading: 'Saving...',
            success: (data) => { onUpdated(data.group); onClose(); return 'Group updated' },
            error:   (err)  => err.message
        })
    }

    /*******************************************************************************
     * Function:    handleDelete
     * Description: Sends a DELETE request to permanently remove the group and
     *              strip it from all members. Calls onDeleted on success.
     * Input:       None
     * Output:      Group document deleted; members' groups arrays updated
     * Return:      void
     ******************************************************************************/
    const handleDelete = async () => {
        try {
            const token = await getToken()
            const { data } = await api.delete(`/api/group/${group._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                toast.success('Group deleted')
                onDeleted()
            } else {
                toast.error(data.message)
            }
        } catch (err) {
            toast.error(err.message)
        }
    }

    const coverSrc   = form.cover_photo   ? URL.createObjectURL(form.cover_photo)   : (group.cover_photo   || assets.sample_cover)
    const pictureSrc = form.group_picture ? URL.createObjectURL(form.group_picture) : (group.group_picture || assets.sample_profile)

    return (
        <div className='fixed top-0 bottom-0 left-0 right-0 z-110 h-screen overflow-y-scroll bg-black/50'>
            <div className='max-w-2xl sm:py-6 mx-auto'>
                <div className='bg-white rounded-lg shadow p-6'>
                    <h1 className='text-2xl font-bold text-gray-900 mb-6'>Edit Group</h1>

                    <form className='space-y-4' onSubmit={handleSubmit}>

                        {/* Cover Photo */}
                        <div className='flex flex-col items-start gap-3'>
                            <label htmlFor='edit_cover' className='block text-sm font-medium text-gray-700'>
                                Cover Photo
                            </label>
                            <input hidden type='file' accept='image/*' id='edit_cover' onChange={setFile('cover_photo')} />
                            <div className='group/cover relative cursor-pointer w-full' onClick={() => document.getElementById('edit_cover').click()}>
                                <img src={coverSrc} alt='cover' className='w-full h-40 object-cover rounded-lg' />
                                <div className='absolute hidden group-hover/cover:flex top-0 left-0 right-0 bottom-0 bg-black/20 rounded-lg items-center justify-center'>
                                    <Pencil className='w-5 h-5 text-white' />
                                </div>
                            </div>
                        </div>

                        {/* Group Picture */}
                        <div className='flex flex-col items-start gap-3'>
                            <label htmlFor='edit_picture' className='block text-sm font-medium text-gray-700'>
                                Group Picture
                            </label>
                            <input hidden type='file' accept='image/*' id='edit_picture' onChange={setFile('group_picture')} />
                            <div className='group/profile relative cursor-pointer' onClick={() => document.getElementById('edit_picture').click()}>
                                <img src={pictureSrc} alt='group' className='w-24 h-24 rounded-full object-cover mt-2' />
                                <div className='absolute hidden group-hover/profile:flex top-0 left-0 right-0 bottom-0 bg-black/20 rounded-full items-center justify-center'>
                                    <Pencil className='w-5 h-5 text-white' />
                                </div>
                            </div>
                        </div>

                        {/* Group Name */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Group Name</label>
                            <input type='text' className='w-full p-3 border border-gray-200 rounded-lg' value={form.name} onChange={set('name')} placeholder='Please enter a group name' />
                        </div>

                        {/* Subject */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Subject</label>
                            <input type='text' className='w-full p-3 border border-gray-200 rounded-lg' value={form.subject} onChange={set('subject')} placeholder='e.g. Computer Science' />
                        </div>

                        {/* School */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>School</label>
                            <input type='text' className='w-full p-3 border border-gray-200 rounded-lg' value={form.school} onChange={set('school')} placeholder='e.g. UCLA' />
                        </div>

                        {/* Location */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Location</label>
                            <input type='text' className='w-full p-3 border border-gray-200 rounded-lg' value={form.location} onChange={set('location')} placeholder='e.g. Los Angeles, CA' />
                        </div>

                        {/* Description */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Description</label>
                            <textarea rows={3} className='w-full p-3 border border-gray-200 rounded-lg' value={form.description} onChange={set('description')} placeholder='Please enter a short description' />
                        </div>

                        <div className='flex justify-end space-x-3 pt-6'>
                            <button type='button' onClick={onClose} className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer'>Cancel</button>
                            <button type='submit' className='px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition cursor-pointer'>Save Changes</button>
                        </div>
                    </form>

                    {/* Danger Zone */}
                    <div className='mt-8 pt-6 border-t border-gray-200'>
                        <p className='text-sm font-semibold text-gray-700 mb-3'>Danger Zone</p>
                        {confirmDelete ? (
                            <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                                <p className='text-sm text-red-700 mb-3'>
                                    Permanently delete <span className='font-semibold'>{group.name}</span>? This removes all members and cannot be undone.
                                </p>
                                <div className='flex gap-2'>
                                    <button onClick={() => setConfirmDelete(false)} className='px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition cursor-pointer'>
                                        Cancel
                                    </button>
                                    <button onClick={handleDelete} className='px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition cursor-pointer'>
                                        Yes, delete group
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => setConfirmDelete(true)} className='px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 transition cursor-pointer'>
                                Delete Group
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditGroupModal
