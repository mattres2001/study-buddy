/*******************************************************************************
 * File:        ForumPostPage.jsx
 * Description: Forum post detail page showing the full post body, upvote
 *              controls, and threaded comments with their own upvote controls.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { ArrowLeft, ThumbsUp, SendHorizonal } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'

/*******************************************************************************
 * Function:    ForumPostPage
 * Description: Fetches a post and its comments by postId URL param. Allows the
 *              authenticated user to upvote the post, upvote comments, and add
 *              new comments.
 * Input:       None (reads postId from URL params and auth from Clerk)
 * Output:      Rendered post detail with comments and comment input
 * Return:      JSX.Element
 ******************************************************************************/
const ForumPostPage = () => {
    const { postId } = useParams()
    const { getToken, userId } = useAuth()
    const navigate = useNavigate()

    const [post, setPost] = useState(null)
    const [comments, setComments] = useState([])
    const [loading, setLoading] = useState(true)
    const [commentText, setCommentText] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const fetchPost = async () => {
        try {
            const token = await getToken()
            const { data } = await api.get(`/api/forum/post/${postId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                setPost(data.post)
                setComments(data.comments)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleUpvotePost = async () => {
        try {
            const token = await getToken()
            const { data } = await api.post(`/api/forum/post/${postId}/upvote`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                setPost(prev => ({ ...prev, upvotes: data.upvotes }))
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleUpvoteComment = async (commentId) => {
        try {
            const token = await getToken()
            const { data } = await api.post(`/api/forum/comment/${commentId}/upvote`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                setComments(prev =>
                    prev.map(c => c._id === commentId ? { ...c, upvotes: data.upvotes } : c)
                )
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleComment = async () => {
        if (!commentText.trim()) return
        try {
            setSubmitting(true)
            const token = await getToken()
            const { data } = await api.post(
                `/api/forum/post/${postId}/comment`,
                { body: commentText },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            if (data.success) {
                setComments(prev => [...prev, data.comment])
                setCommentText('')
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

    useEffect(() => { fetchPost() }, [postId])

    if (loading) return <div className='text-center py-20 text-slate-400'>Loading...</div>
    if (!post) return null

    const postUpvoted = post.upvotes?.includes(userId)

    return (
        <div className='min-h-screen bg-slate-50'>
            <div className='max-w-3xl mx-auto p-6'>
                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className='flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-5 transition cursor-pointer'
                >
                    <ArrowLeft className='w-4 h-4'/> Back
                </button>

                {/* Post */}
                <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6'>
                    <h1 className='text-xl font-bold text-slate-900 mb-3'>{post.title}</h1>

                    <div className='flex items-center gap-3 mb-4'>
                        <img
                            src={post.author_id?.profile_picture}
                            alt=''
                            className='w-8 h-8 rounded-full object-cover'
                        />
                        <div>
                            <p className='text-sm font-medium text-slate-700'>{post.author_id?.full_name}</p>
                            <p className='text-xs text-slate-400'>@{post.author_id?.username} · {formatDate(post.createdAt)}</p>
                        </div>
                    </div>

                    {post.body && (
                        <p className='text-slate-700 text-sm leading-relaxed whitespace-pre-wrap mb-5'>{post.body}</p>
                    )}

                    <button
                        onClick={handleUpvotePost}
                        className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition cursor-pointer
                            ${postUpvoted
                                ? 'bg-primary-50 text-primary-600 font-semibold'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                        <ThumbsUp className='w-4 h-4'/>
                        {post.upvotes?.length ?? 0} {post.upvotes?.length === 1 ? 'upvote' : 'upvotes'}
                    </button>
                </div>

                {/* Comments */}
                <h2 className='text-base font-semibold text-slate-700 mb-3'>
                    {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
                </h2>

                <div className='flex flex-col gap-3 mb-6'>
                    {comments.map((comment) => {
                        const commentUpvoted = comment.upvotes?.includes(userId)
                        return (
                            <div key={comment._id} className='bg-white rounded-2xl border border-gray-100 shadow-sm p-4'>
                                <div className='flex items-center gap-2 mb-2'>
                                    <img
                                        src={comment.author_id?.profile_picture}
                                        alt=''
                                        className='w-7 h-7 rounded-full object-cover'
                                    />
                                    <div>
                                        <span className='text-sm font-medium text-slate-700'>{comment.author_id?.full_name}</span>
                                        <span className='text-xs text-slate-400 ml-2'>{formatDate(comment.createdAt)}</span>
                                    </div>
                                </div>
                                <p className='text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-3'>{comment.body}</p>
                                <button
                                    onClick={() => handleUpvoteComment(comment._id)}
                                    className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition cursor-pointer
                                        ${commentUpvoted
                                            ? 'bg-primary-50 text-primary-600 font-semibold'
                                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                >
                                    <ThumbsUp className='w-3.5 h-3.5'/>
                                    {comment.upvotes?.length ?? 0}
                                </button>
                            </div>
                        )
                    })}
                </div>

                {/* Add comment */}
                <div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-4'>
                    <p className='text-sm font-medium text-slate-700 mb-2'>Leave a comment</p>
                    <div className='flex items-end gap-2'>
                        <textarea
                            placeholder='Write your comment...'
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    handleComment()
                                }
                            }}
                            rows={3}
                            className='flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-400 resize-none'
                        />
                        <button
                            onClick={handleComment}
                            disabled={submitting || !commentText.trim()}
                            className='bg-primary-500 hover:bg-primary-600 active:scale-95 text-white p-2.5 rounded-full transition cursor-pointer disabled:opacity-50 flex-shrink-0'
                        >
                            <SendHorizonal size={16}/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ForumPostPage
