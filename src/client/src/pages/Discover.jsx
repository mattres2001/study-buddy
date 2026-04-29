/*******************************************************************************
 * File:        Discover.jsx
 * Description: Discovery page with tabbed search for finding users (by name,
 *              username, bio, or location) and groups (by name, description,
 *              subject, or location).
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import React, { useState, useEffect, useCallback } from 'react'
import { Search } from 'lucide-react'
import UserCard from '../components/UserCard'
import GroupCard from '../components/GroupCard'
import Loading from '../components/Loading'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import api from '../api/axios'

/*******************************************************************************
 * Function:    Discover
 * Description: Renders a tabbed discovery page. The People tab searches users
 *              and shows recommended users when idle. The Groups tab searches
 *              groups by name, description, subject, or location.
 * Input:       None (reads auth from Clerk; fetches data from the API)
 * Output:      Rendered search results for people or groups
 * Return:      JSX.Element
 ******************************************************************************/
const Discover = () => {

    const { getToken } = useAuth()

    const [tab, setTab] = useState('people')
    const [input, setInput] = useState('')

    const [users, setUsers] = useState([])
    const [userLoading, setUserLoading] = useState(false)
    const [recommendedUsers, setRecommendedUsers] = useState([])
    const [recLoading, setRecLoading] = useState(false)

    const [groups, setGroups] = useState([])
    const [groupLoading, setGroupLoading] = useState(false)

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                setRecLoading(true)
                const token = await getToken()
                const { data } = await api.get('/api/user/recommendations', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (data.success) setRecommendedUsers(data.recommendations)
                else toast.error(data.message)
            } catch (error) {
                toast.error(error.message)
            } finally {
                setRecLoading(false)
            }
        }
        fetchRecommendations()
    }, [getToken])

    const searchUsers = useCallback(async (value) => {
        if (!value.trim()) { setUsers([]); return }
        try {
            setUsers([])
            setUserLoading(true)
            const { data } = await api.post('/api/user/discover', { input: value }, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })
            data.success ? setUsers(data.users) : toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        } finally {
            setUserLoading(false)
        }
    }, [getToken])

    const searchGroups = useCallback(async (value) => {
        if (!value.trim()) { setGroups([]); return }
        try {
            setGroups([])
            setGroupLoading(true)
            const { data } = await api.post('/api/group/search', { input: value }, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })
            data.success ? setGroups(data.groups) : toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        } finally {
            setGroupLoading(false)
        }
    }, [getToken])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (tab === 'people') searchUsers(input)
            else searchGroups(input)
        }, 400)
        return () => clearTimeout(timer)
    }, [input, tab, searchUsers, searchGroups])

    const loading = tab === 'people' ? userLoading : groupLoading

    const placeholder = tab === 'people'
        ? 'Search people by name, username, bio, or location...'
        : 'Search groups by name, subject, description, or location...'

    return (
        <div className='min-h-screen bg-gradient-to-b from-slate-50 to-white'>
            <div className='max-w-6xl mx-auto p-6'>

                {/* Title */}
                <div className='mb-6'>
                    <h1 className='text-3xl font-bold text-slate-900 mb-1'>Discover</h1>
                    <p className='text-slate-600'>Find people and study groups to connect with</p>
                </div>

                {/* Tabs */}
                <div className='flex gap-1 mb-6 bg-slate-100 rounded-lg p-1 w-fit'>
                    {['people', 'groups'].map(t => (
                        <button
                            key={t}
                            onClick={() => { setTab(t); setInput('') }}
                            className={`px-5 py-2 rounded-md text-sm font-medium transition capitalize
                                ${tab === t
                                    ? 'bg-white text-primary-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {t === 'people' ? '👤 People' : '👥 Groups'}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className='mb-8 shadow-md rounded-md border border-slate-200/60 bg-white/80'>
                    <div className='p-6'>
                        <div className='relative'>
                            <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5' />
                            <input
                                type="text"
                                placeholder={placeholder}
                                className='pl-10 sm:pl-12 py-2 w-full border border-gray-300 rounded-md max-sm:text-sm'
                                onChange={(e) => setInput(e.target.value)}
                                value={input}
                            />
                        </div>
                    </div>
                </div>

                {/* People tab content */}
                {tab === 'people' && (
                    <>
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
                                <UserCard user={user} key={user._id} />
                            ))}
                        </div>
                    </>
                )}

                {/* Groups tab content */}
                {tab === 'groups' && (
                    <>
                        {!input && (
                            <p className='text-slate-500 text-sm'>
                                Type a group name, subject, or location to search.
                            </p>
                        )}

                        <div className='flex flex-wrap gap-6'>
                            {groups.map((group) => (
                                <GroupCard group={group} key={group._id} />
                            ))}
                        </div>

                        {input && !groupLoading && groups.length === 0 && (
                            <p className='text-slate-500 text-sm mt-4'>No groups found for "{input}".</p>
                        )}
                    </>
                )}

                {loading && <Loading height='60vh' />}

            </div>
        </div>
    )
}

export default Discover
