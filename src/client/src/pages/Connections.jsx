/*******************************************************************************
 * File:        Connections.jsx
 * Description: Connections management page displaying the user's connections,
 *              followers, following, and pending requests with accept, decline,
 *              unfollow, and message controls.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import React, { useEffect, useState } from 'react'
import { Users, UserPlus, UserCheck, UserRoundPen, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useAuth } from '@clerk/clerk-react'
import { fetchConnections } from '../features/connections/connectionsSlice'
import api from '../api/axios'
import toast from 'react-hot-toast'

/*******************************************************************************
 * Function:    Connections
 * Description: Displays the authenticated user's connections, followers,
 *              following list, and pending connection requests from Redux state.
 *              Supports accepting/declining requests, unfollowing, and messaging.
 * Input:       None (reads connection state from Redux; fetches on mount)
 * Output:      Rendered connections page with stat cards, tabs, and user list
 * Return:      JSX.Element
 ******************************************************************************/
const Connections = () => {

    const [currentTab, setCurrentTab] = useState('Followers')

    const navigate  = useNavigate()
    const { getToken } = useAuth()
    const dispatch  = useDispatch()

    const { connections, pendingConnections, followers, following } = useSelector((state) => state.connections)

    const tabs = [
        { label: 'Followers',   value: followers,          icon: Users },
        { label: 'Following',   value: following,          icon: UserCheck },
        { label: 'Pending',     value: pendingConnections, icon: UserRoundPen },
        { label: 'Connections', value: connections,        icon: UserPlus },
    ]

    useEffect(() => {
        getToken().then((token) => dispatch(fetchConnections(token)))
    }, [])

    /*******************************************************************************
     * Function:    handleUnfollow
     * Description: Removes the target user from the current user's following list.
     * Input:       userId (string) - ID of the user to unfollow
     * Output:      Following list updated in Redux
     * Return:      void
     ******************************************************************************/
    const handleUnfollow = async (userId) => {
        try {
            const token = await getToken()
            const { data } = await api.post('/api/user/unfollow', { id: userId }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                toast.success(data.message)
                dispatch(fetchConnections(await getToken()))
            } else {
                toast.error(data.message)
            }
        } catch (err) {
            toast.error(err.message)
        }
    }

    /*******************************************************************************
     * Function:    handleAccept
     * Description: Accepts a pending incoming connection request.
     * Input:       userId (string) - ID of the requesting user
     * Output:      Connection accepted; Redux state refreshed
     * Return:      void
     ******************************************************************************/
    const handleAccept = async (userId) => {
        try {
            const token = await getToken()
            const { data } = await api.post('/api/user/accept', { id: userId }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                toast.success(data.message)
                dispatch(fetchConnections(await getToken()))
            } else {
                toast.error(data.message)
            }
        } catch (err) {
            toast.error(err.message)
        }
    }

    /*******************************************************************************
     * Function:    handleDecline
     * Description: Declines a pending incoming connection request.
     * Input:       userId (string) - ID of the requesting user
     * Output:      Request removed; Redux state refreshed
     * Return:      void
     ******************************************************************************/
    const handleDecline = async (userId) => {
        try {
            const token = await getToken()
            const { data } = await api.post('/api/user/decline', { id: userId }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                toast.success(data.message)
                dispatch(fetchConnections(await getToken()))
            } else {
                toast.error(data.message)
            }
        } catch (err) {
            toast.error(err.message)
        }
    }

    const activeUsers = tabs.find((t) => t.label === currentTab)?.value ?? []

    const emptyMessages = {
        Followers:   "Nobody is following you yet.",
        Following:   "You aren't following anyone yet.",
        Pending:     "No pending connection requests.",
        Connections: "You have no connections yet.",
    }

    return (
        <div className='min-h-screen bg-slate-50'>
            <div className='max-w-5xl mx-auto p-6'>

                {/* Title */}
                <div className='mb-8'>
                    <h1 className='text-3xl font-bold text-slate-900 mb-1'>Connections</h1>
                    <p className='text-slate-500'>Manage your network and discover new connections</p>
                </div>

                {/* Stat cards */}
                <div className='flex flex-wrap gap-4 mb-6'>
                    {tabs.map(({ label, value, icon: Icon }) => (
                        <button
                            key={label}
                            onClick={() => setCurrentTab(label)}
                            className={`flex items-center gap-3 px-5 py-3 bg-white rounded-xl shadow-sm border transition-all cursor-pointer
                                ${currentTab === label
                                    ? 'border-primary-300 ring-2 ring-primary-100'
                                    : 'border-gray-100 hover:border-gray-200'}`}
                        >
                            <Icon className={`w-5 h-5 ${currentTab === label ? 'text-primary-500' : 'text-gray-400'}`} />
                            <div className='text-left'>
                                <p className={`text-lg font-bold leading-none ${currentTab === label ? 'text-primary-600' : 'text-slate-800'}`}>
                                    {value.length}
                                </p>
                                <p className='text-xs text-slate-500 mt-0.5'>{label}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* User list */}
                {activeUsers.length === 0 ? (
                    <div className='text-center py-16 text-slate-400'>
                        <p className='text-lg'>{emptyMessages[currentTab]}</p>
                    </div>
                ) : (
                    <div className='flex flex-wrap gap-5'>
                        {activeUsers.map((user) => (
                            <div key={user._id} className='w-full max-w-sm flex gap-4 p-5 bg-white shadow-sm border border-gray-100 rounded-xl'>
                                <img
                                    src={user.profile_picture}
                                    alt={user.full_name}
                                    className='rounded-full w-12 h-12 object-cover flex-shrink-0 shadow-sm'
                                />
                                <div className='flex-1 min-w-0'>
                                    <p className='font-semibold text-slate-800 truncate'>{user.full_name}</p>
                                    <p className='text-slate-400 text-sm'>@{user.username}</p>
                                    {user.bio && (
                                        <p className='text-sm text-gray-500 mt-1 line-clamp-2'>{user.bio}</p>
                                    )}
                                    <div className='flex flex-wrap gap-2 mt-3'>
                                        <button
                                            onClick={() => navigate(`/profile/${user._id}`)}
                                            className='px-3 py-1.5 text-sm rounded-lg bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-700 text-white transition cursor-pointer'
                                        >
                                            View Profile
                                        </button>

                                        {currentTab === 'Following' && (
                                            <button
                                                onClick={() => handleUnfollow(user._id)}
                                                className='px-3 py-1.5 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer'
                                            >
                                                Unfollow
                                            </button>
                                        )}

                                        {currentTab === 'Pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleAccept(user._id)}
                                                    className='px-3 py-1.5 text-sm rounded-lg bg-green-500 hover:bg-green-600 text-white transition cursor-pointer'
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleDecline(user._id)}
                                                    className='px-3 py-1.5 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer'
                                                >
                                                    Decline
                                                </button>
                                            </>
                                        )}

                                        {currentTab === 'Connections' && (
                                            <button
                                                onClick={() => navigate(`/messages/${user._id}`)}
                                                className='px-3 py-1.5 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-slate-700 transition cursor-pointer flex items-center gap-1.5'
                                            >
                                                <MessageSquare className='w-4 h-4' /> Message
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Connections
