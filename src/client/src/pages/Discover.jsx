/*******************************************************************************
 * File:        Discover.jsx
 * Description: User discovery page with a search bar for finding users by name,
 *              username, email, or location, and a recommended users section.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import React, { useState, useEffect, useCallback } from 'react'
import { dummyConnectionsData } from '../assets/assets'
import { Search } from 'lucide-react'
import UserCard from '../components/UserCard'
import Loading from '../components/Loading'
import { useAuth } from '@clerk/clerk-react'
import { useDispatch } from 'react-redux'
import { fetchUser } from '../features/user/userSlice'
import toast from 'react-hot-toast'
import api from '../api/axios'

/*******************************************************************************
 * Function:    Discover
 * Description: Renders a user search page and a recommended users section.
 *              Debounces the search input and fetches results from the API.
 * Input:       None (reads auth from Clerk; fetches data from the API)
 * Output:      Rendered user search results and recommendation cards
 * Return:      JSX.Element
 ******************************************************************************/
const Discover = () => {
    
    const dispatch = useDispatch()
    const [ input, setInput ] = useState('')
    const [ users, setUsers ] = useState([])
    const [ loading, setLoading ] = useState(false)
    const [recommendedUsers, setRecommendedUsers] = useState([])
    const [recLoading, setRecLoading] = useState(false)
    const { getToken } = useAuth()

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                setRecLoading(true)
                const token = await getToken()

                const { data } = await api.get('/api/user/recommendations', {
                    headers: { Authorization: `Bearer ${token}` }
                })

                if (data.success) {
                    setRecommendedUsers(data.recommendations)
                } else {
                    toast.error(data.message)
                }

            } catch (error) {
                toast.error(error.message)
            } finally {
                setRecLoading(false)
        }
    }

    fetchRecommendations()
    }, [getToken])

    const handleSearch = useCallback(async (value) => {
        if (!value.trim()) {
            setUsers([])
            return
        }
        try {
            setUsers([])
            setLoading(true)
            const { data } = await api.post('/api/user/discover', { input: value }, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })
            data.success ? setUsers(data.users) : toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }, [getToken])

    // Add this debounce effect
    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch(input)
        }, 400)
        return () => clearTimeout(timer)
    }, [input, handleSearch])

    return (
        <div className='min-h-screen bg-gradient-to-b from-slate-50 to-white'>
            <div className='max-w-6xl mx-auto p-6'>

                {/* Title */}
                <div className='mb-8'>
                    <h1 className='text-3xl font-bold text-slate-900 mb-2'>Discover People</h1>
                    <p className='text-slate-600'>Connect with your peers and grow your network</p>
                </div>

                {/* Search */}
                <div className='mb-8 shadow-md rounded-md border border-slate-200/60 bg-white/80'>
                    <div className='p-6'>
                        <div className='relative'>
                            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5'/>
                            <input
                                type="text"
                                placeholder='Search people by name, username, bio, or location...'
                                className='pl-10 sm:pl-12 py-2 w-full border border-gray-300 rounded-md max-sm:text-sm'
                                onChange={(e) => setInput(e.target.value)}
                                value={input}
                            />
                        </div>
                    </div>
                </div>

                {!input && (
                <div className='mb-10'>
                    <h2 className='text-xl font-semibold text-slate-800 mb-4'>
                    Recommended for You
                    </h2>

                    {recLoading ? (
                    <Loading height='200px' />
                    ) : (
                    <div className='flex flex-wrap gap-6'>
                        {recommendedUsers.map((userObj) => (
                            <UserCard 
                                user={userObj.user} 
                                key={userObj.user._id} 
                                sharedCourses={userObj.sharedCourses}
                                sharedSubjects={userObj.sharedSubjects}
                                mutualConnectionsCount={userObj.mutualConnectionsCount}
                            />
                        ))}
                    </div>
                    )}
                </div>
                )}

                <div className='flex flex-wrap gap-6'>
                    {users.map((user) => (
                        <UserCard user={user} key={user._id}/>
                    ))}
                </div>

                {
                    loading && (<Loading height='60vh'/>)
                }

            </div>
        </div>
    )
}

export default Discover