import React, { useState, useEffect } from 'react'
import { ArrowLeft, Send } from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'
import Loading from './Loading'
import api from '../api/axios'
import toast from 'react-hot-toast'

const ShareModal = ({setShowModal}) => {


    
    const [ connections, setConnections ] = useState([])
    const [ loading, setLoading ] = useState(false)
    const { getToken } = useAuth()

    // Get User Connections
    const fetchConnections = async () => {
        try {
            setLoading(true)
            const { data } = await api.get('/api/user/connections', { headers: { Authorization: `Bearer ${await getToken()}` }})

            if (data.success) {
                setConnections(data.connections)
                // toast.success("Success")
            }
            else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
        setLoading(false)

    }

    useEffect(() => {
        fetchConnections()
    },[])


    return (
        <div className='fixed inset-0 z-110 min-h-screen bg-black/80 backdrop-blur text-white flex items-center justify-center p-4'>
            <div className='w-full max-w-md'>
                <div className='text-center mb-4 flex items-center justify-between'>
                    <button onClick={() => setShowModal(false)} className='text-white p-2 cursor-pointer'>
                        <ArrowLeft />
                    </button>
                    <h2 className='text-lg font-semibold'>Share Post</h2>
                    <span className='w-10'></span>
                </div>

                <div className='rounded-lg h-96 flex items-center justify-center relative '>
                    <div className='bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl h-96'>
                        {/* Map Connections  */}
                        {
                            connections.map((connection, index) => (
                                <div key={index} className='flex items-center cursor-pointer' 
                                    onClick={() => {
                                        const checkBox = document.getElementById(`share-user-${index}`)
                                        checkBox.checked = !checkBox.checked
                                    }}>

                                    <img src={connection.profile_picture} alt="" className='w-8 h-8 rounded-full'/>
                                    <div className='flex justify-between pl-2 space-x-1 items-center'>
                                        <p className='text-black font-medium'>{connection.full_name}</p>
                                        <p className='text-gray-500 text-sm'>@{connection.username}</p>
                                    </div>
                                    <input id={`share-user-${index}`} type='checkbox' className='scale-150 ml-auto'/>
                                </div>
                            ))
                        }
                    </div>
                </div>
                <button className='flex items-center justify-center gap-2 text-white py-3 mt-4 w-full rounded bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition cursor-pointer'>
                    <Send size={18}/> Share
                </button>
            </div>
        </div>
    )
}

export default ShareModal
