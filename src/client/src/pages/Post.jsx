import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { dummyPostsData } from '../assets/assets'
import { useAuth } from '@clerk/clerk-react'
import Loading from '../components/Loading'
import PostCard from '../components/PostCard'
import api from '../api/axios'
import toast from 'react-hot-toast'

const Post = () => {


    const { postId } = useParams()

    const [ post, setPost ] = useState(null)
    const [ loading, setLoading ] = useState(true)
    const { getToken } = useAuth()

    const fetchPost = async () => {
        try {
            const { data } = await api.get('/api/post/view', { 
                params: { postId },
                headers: { Authorization: `Bearer ${await getToken()}` 
            }})

            if (data.success) {
                setPost(data.post);
                console.log(data.post)
                toast.success("Yuuh")
            }
            else
                toast.error(data.message)
            setLoading(true)
        } catch (error) {
            toast.error(error.message)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchPost()
    })

    return !loading ? (
        <div>
            
        </div>
    ) : <Loading/>
}

export default Post
