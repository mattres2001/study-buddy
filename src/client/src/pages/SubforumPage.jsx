/*******************************************************************************
 * File:        SubforumPage.jsx
 * Description: Subforum detail page listing all posts within a class subforum.
 *              Authenticated users can create a new post via an inline modal.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { ArrowLeft, MessageSquare, ThumbsUp, Plus, X, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'

/*******************************************************************************
 * Function:    SubforumPage
 * Description: Fetches subforum data and its posts by subforumId URL param.
 *              Provides a modal form to create a new post in the subforum.
 * Input:       None (reads subforumId from URL params and auth from Clerk)
 * Output:      Rendered post listing with creation modal
 * Return:      JSX.Element
 ******************************************************************************/
const SubforumPage = () => {
    const { subforumId } = useParams()
    const { getToken } = useAuth()
    const navigate = useNavigate()

    const [subforum, setSubforum] = useState(null)
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState({ title: '', body: '' })
    const [submitting, setSubmitting] = useState(false)

    const fetchData = async () => {
        try {
            const token = await getToken()
            const { data } = await api.get(`/api/forum/subforums/${subforumId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                setSubforum(data.subforum)
                setPosts(data.posts)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async (e) => {
        e.preventDefault()
        if (!form.title.trim()) return toast.error('Title is required')
        try {
            setSubmitting(true)
            const token = await getToken()
            const { data } = await api.post(
                `/api/forum/subforums/${subforumId}/post`,
                form,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            if (data.success) {
                setPosts(prev => [{ ...data.post, comment_count: 0 }, ...prev])
                setForm({ title: '', body: '' })
                setShowModal(false)
                toast.success('Post created!')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setSubmitting(false)
        }
    }

    const formatDate = (iso) => new Date(iso).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric'
    })

    useEffect(() => { fetchData() }, [subforumId])

    if (loading) return <div className='text-center py-20 text-slate-400'>Loading...</div>
    if (!subforum) return null

    return (
        <div className='min-h-screen bg-slate-50'>
            <div className='max-w-4xl mx-auto p-6'>
                {/* Back + header */}
                <button
                    onClick={() => navigate('/forum')}
                    className='flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-5 transition cursor-pointer'
                >
                    <ArrowLeft className='w-4 h-4'/> All subforums
                </button>

                <div className='flex items-start justify-between gap-4 mb-8'>
                    <div>
                        <div className='flex items-center gap-2 flex-wrap mb-1'>
                            <span className='text-xs font-semibold px-2 py-0.5 bg-primary-50 text-primary-600 rounded-full'>
                                {subforum.class_name}
                            </span>
                            {subforum.school && (
                                <span className='text-xs text-slate-400'>{subforum.school}</span>
                            )}
                        </div>
                        <h1 className='text-2xl font-bold text-slate-900'>{subforum.name}</h1>
                        {subforum.description && (
                            <p className='text-slate-500 mt-1 text-sm'>{subforum.description}</p>
                        )}
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className='flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl shadow transition active:scale-95 cursor-pointer flex-shrink-0'
                    >
                        <Plus className='w-4 h-4'/> New Post
                    </button>
                </div>

                {/* Post list */}
                {posts.length === 0 ? (
                    <div className='text-center py-20'>
                        <FileText className='w-12 h-12 text-slate-300 mx-auto mb-3'/>
                        <p className='text-slate-500 font-medium'>No posts yet</p>
                        <p className='text-slate-400 text-sm'>Be the first to start a discussion!</p>
                    </div>
                ) : (
                    <div className='flex flex-col gap-3'>
                        {posts.map((post) => (
                            <button
                                key={post._id}
                                onClick={() => navigate(`/forum/post/${post._id}`)}
                                className='w-full text-left bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-primary-100 transition cursor-pointer'
                            >
                                <h3 className='font-semibold text-slate-800 mb-1'>{post.title}</h3>
                                {post.body && (
                                    <p className='text-sm text-slate-500 line-clamp-2 mb-3'>{post.body}</p>
                                )}
                                <div className='flex items-center gap-4 text-xs text-slate-400'>
                                    <div className='flex items-center gap-1.5'>
                                        <img
                                            src={post.author_id?.profile_picture}
                                            alt=''
                                            className='w-5 h-5 rounded-full object-cover'
                                        />
                                        <span>{post.author_id?.full_name}</span>
                                    </div>
                                    <span>{formatDate(post.createdAt)}</span>
                                    <div className='flex items-center gap-1'>
                                        <ThumbsUp className='w-3.5 h-3.5'/> {post.upvotes?.length ?? 0}
                                    </div>
                                    <div className='flex items-center gap-1'>
                                        <MessageSquare className='w-3.5 h-3.5'/> {post.comment_count ?? 0}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Create post modal */}
            {showModal && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4'>
                    <div className='bg-white rounded-2xl shadow-xl w-full max-w-lg p-6'>
                        <div className='flex items-center justify-between mb-5'>
                            <h2 className='text-lg font-bold text-slate-900'>New Post</h2>
                            <button onClick={() => setShowModal(false)} className='text-slate-400 hover:text-slate-600 cursor-pointer'>
                                <X className='w-5 h-5'/>
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className='flex flex-col gap-4'>
                            <div>
                                <label className='block text-sm font-medium text-slate-700 mb-1'>Title *</label>
                                <input
                                    type='text'
                                    placeholder='What do you want to discuss?'
                                    value={form.title}
                                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    className='w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-400'
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-slate-700 mb-1'>Body</label>
                                <textarea
                                    placeholder='Add more details (optional)...'
                                    value={form.body}
                                    onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                                    rows={5}
                                    className='w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-400 resize-none'
                                />
                            </div>

                            <div className='flex justify-end gap-3'>
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
                                    {submitting ? 'Posting...' : 'Post'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SubforumPage
