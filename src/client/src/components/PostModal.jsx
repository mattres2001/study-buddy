import React, { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import PostCard from './PostCard'

const PostModal = ({post, setShowModal}) => {
    
    const [ loading, setLoading ] = useState(false)
    
    return (
        <div className='fixed inset-0 z-110 min-h-screen bg-black/80 backdrop-blur flex items-center justify-center p-4'>
            <div className='w-full max-w-md'>
                <div className='text-center mb-4 flex items-center justify-between'>
                    <button onClick={() => setShowModal(false)} className='text-white p-2 cursor-pointer'>
                        <ArrowLeft />
                    </button>
                    <h2 className='text-lg font-semibold text-white'> Post</h2>
                    <span className='w-10'></span>
                </div>

                <PostCard post={post} variant='modal' disableNavigation />
            </div>
        </div>
    )
}

export default PostModal
