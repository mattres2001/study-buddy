/*******************************************************************************
 * File:        Forum.jsx
 * Description: Main forum page listing all class subforums with post counts.
 *              Authenticated users can create a new subforum via an inline modal.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { MessageSquare, Plus, BookOpen, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'

/*******************************************************************************
 * Function:    Forum
 * Description: Fetches and displays all subforums. Provides a modal form to
 *              create a new class-specific subforum.
 * Input:       None (reads auth from Clerk)
 * Output:      Rendered subforum listing with creation modal
 * Return:      JSX.Element
 ******************************************************************************/
const Forum = () => {
    const { getToken } = useAuth()
    const navigate = useNavigate()

    const [subforums, setSubforums] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState({ name: '', class_name: '', school: '', description: '' })
    const [submitting, setSubmitting] = useState(false)

    const fetchSubforums = async () => {
        try {
            const token = await getToken()
            const { data } = await api.get('/api/forum/subforums', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) setSubforums(data.subforums)
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async (e) => {
        e.preventDefault()
        if (!form.name.trim() || !form.class_name.trim()) {
            return toast.error('Name and class name are required')
        }
        try {
            setSubmitting(true)
            const token = await getToken()
            const { data } = await api.post('/api/forum/subforums', form, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                setSubforums(prev => [...prev, { ...data.subforum, post_count: 0 }])
                setForm({ name: '', class_name: '', school: '', description: '' })
                setShowModal(false)
                toast.success('Subforum created!')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setSubmitting(false)
        }
    }

    useEffect(() => { fetchSubforums() }, [])

    return (
        <div className='min-h-screen bg-slate-50'>
            <div className='max-w-4xl mx-auto p-6'>
                {/* Header */}
                <div className='flex items-center justify-between mb-8'>
                    <div>
                        <h1 className='text-3xl font-bold text-slate-900'>Forum</h1>
                        <p className='text-slate-500 mt-1'>Class discussion boards</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className='flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl shadow transition active:scale-95 cursor-pointer'
                    >
                        <Plus className='w-4 h-4'/> New Subforum
                    </button>
                </div>

                {/* Subforum list */}
                {loading ? (
                    <div className='text-center py-20 text-slate-400'>Loading...</div>
                ) : subforums.length === 0 ? (
                    <div className='text-center py-20'>
                        <BookOpen className='w-12 h-12 text-slate-300 mx-auto mb-3'/>
                        <p className='text-slate-500 font-medium'>No subforums yet</p>
                        <p className='text-slate-400 text-sm'>Create the first one for your class!</p>
                    </div>
                ) : (
                    <div className='flex flex-col gap-3'>
                        {subforums.map((sf) => (
                            <button
                                key={sf._id}
                                onClick={() => navigate(`/forum/${sf._id}`)}
                                className='w-full text-left bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-primary-100 transition cursor-pointer'
                            >
                                <div className='flex items-start justify-between gap-4'>
                                    <div className='flex-1 min-w-0'>
                                        <div className='flex items-center gap-2 flex-wrap'>
                                            <span className='text-xs font-semibold px-2 py-0.5 bg-primary-50 text-primary-600 rounded-full'>
                                                {sf.class_name}
                                            </span>
                                            {sf.school && (
                                                <span className='text-xs text-slate-400'>{sf.school}</span>
                                            )}
                                        </div>
                                        <h2 className='text-base font-semibold text-slate-800 mt-1'>{sf.name}</h2>
                                        {sf.description && (
                                            <p className='text-sm text-slate-500 mt-0.5 line-clamp-2'>{sf.description}</p>
                                        )}
                                    </div>
                                    <div className='flex items-center gap-1 text-slate-400 flex-shrink-0 text-sm'>
                                        <MessageSquare className='w-4 h-4'/>
                                        {sf.post_count}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Create subforum modal */}
            {showModal && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4'>
                    <div className='bg-white rounded-2xl shadow-xl w-full max-w-md p-6'>
                        <div className='flex items-center justify-between mb-5'>
                            <h2 className='text-lg font-bold text-slate-900'>New Subforum</h2>
                            <button onClick={() => setShowModal(false)} className='text-slate-400 hover:text-slate-600 cursor-pointer'>
                                <X className='w-5 h-5'/>
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className='flex flex-col gap-4'>
                            <div>
                                <label className='block text-sm font-medium text-slate-700 mb-1'>Class Name *</label>
                                <input
                                    type='text'
                                    placeholder='e.g. COMP 490'
                                    value={form.class_name}
                                    onChange={e => setForm(f => ({ ...f, class_name: e.target.value }))}
                                    className='w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-400'
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-slate-700 mb-1'>Subforum Name *</label>
                                <input
                                    type='text'
                                    placeholder='e.g. COMP 490 – Software Engineering'
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className='w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-400'
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-slate-700 mb-1'>School</label>
                                <input
                                    type='text'
                                    placeholder='e.g. CSUN'
                                    value={form.school}
                                    onChange={e => setForm(f => ({ ...f, school: e.target.value }))}
                                    className='w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-400'
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-slate-700 mb-1'>Description</label>
                                <textarea
                                    placeholder='What is this subforum for?'
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    rows={3}
                                    className='w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-400 resize-none'
                                />
                            </div>

                            <div className='flex justify-end gap-3 mt-1'>
                                <button
                                    type='button'
                                    onClick={() => setShowModal(false)}
                                    className='px-4 py-2 border border-gray-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 cursor-pointer transition'
                                >
                                    Cancel
                                </button>
                                <button
                                    type='submit'
                                    disabled={submitting}
                                    className='px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-semibold transition active:scale-95 cursor-pointer disabled:opacity-60'
                                >
                                    {submitting ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Forum
