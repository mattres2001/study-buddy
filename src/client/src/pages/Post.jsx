import React, { useState } from 'react'
import { dummyPostsData } from '../assets/assets'
import Loading from '../components/Loading'
import PostCard from '../components/PostCard'
import api from '../api/axios'

const Post = () => {

    const [ post, setPost ] = useState(null)
    const [ loading, setLoading ] = useState(true)
    const { getToken } = useAuth()

    const fetchPost = async () => {
        try {
            const { data } = await api.get('/api/post/view', { headers: { Authorization: `Bearer ${await getToken()}` }})
            if (data.success)
                setPost(data);
            else
                toast.error(data.message)
            setLoading(true)
        } catch (error) {
            toast.error(error.message)
        }
        setLoading(false)
    }

    return !loading ? (
        <div>
            
        </div>
    ) : <Loading/>
}

export default Post
