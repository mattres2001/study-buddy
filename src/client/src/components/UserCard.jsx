/*******************************************************************************
 * File:        UserCard.jsx
 * Description: User profile card component used in Discover and recommendations,
 *              displaying user info with follow, connect, and message actions.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import React from 'react'
import { dummyUserData } from '../assets/assets'
import { MapPin, MessageCircle, Plus, UserPlus } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { fetchUser } from '../features/user/userSlice'

/*******************************************************************************
 * Function:    UserCard
 * Description: Renders a user profile card with avatar, name, location, and
 *              action buttons for following, connecting, or messaging the user.
 * Input:       user (object) - user profile data
 *              sharedCourses (array) - courses shared with the current user
 *              sharedSubjects (array) - subjects shared with the current user
 *              mutualConnectionsCount (number) - count of mutual connections
 * Output:      Rendered user card with social action controls
 * Return:      JSX.Element
 ******************************************************************************/
const UserCard = ({user, sharedCourses = [], sharedSubjects = [], mutualConnectionsCount = 0 }) => {

    const currentUser = useSelector((state) => state.user.value)
    const { getToken } = useAuth()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleFollow = async () => {
        try {
            const { data } = await api.post('/api/user/follow', { id: user._id }, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })
            if (data.success) {
                toast.success(data.message)
                dispatch(fetchUser(await getToken()))
            } else {
                toast.error(data.message)
            }
            
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleConnectionRequest = async () => {
        if (currentUser.connections.includes(user._id)) {
            return navigate('/messages/' + user._id)
        }

        try {
            const { data } = await api.post('/api/user/connect', { id: user._id }, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })
            if (data.success) {
                toast.success(data.message)
                dispatch(fetchUser(await getToken()))
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    return (
        <div key={user._id} className='p-4 pt-6 flex flex-col justify-between w-72 shadow border border-gray-200 rounded-md'>
            <div className='text-center'>
                <img src={user.profile_picture} alt="" className='rounded-full w-16 shadow-md mx-auto'/>
                <p className='mt-4 font-semibold'>{user.full_name}</p>
                {user.username && <p className='text-gray-500 font-light'>@{user.username}</p>}
                {user.bio && <p className='text-gray-600 mt-2 text-center text-sm px-4'>{user.bio}</p>}
            </div>

            <div className='flex items-center justify-center gap-2 mt-4 text-xs text-gray-600'>
                <div className='flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1'>
                    <MapPin className='w-4 h-4'/> {user.location}
                </div>
                <div className='flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1'>
                    <span>{user.followers.length}</span> Followers
                </div>
            </div>

            {/* Recommendation caption */}
            {(sharedCourses.length > 0 || sharedSubjects.length > 0 || mutualConnectionsCount > 0) && (
                <div className='mt-3 flex flex-wrap gap-1 justify-center'>
                    {mutualConnectionsCount > 0 && (
                        <span className='text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full px-2 py-0.5'>
                            {mutualConnectionsCount} mutual {mutualConnectionsCount === 1 ? 'connection' : 'connections'}
                        </span>
                    )}
                    {sharedCourses.length > 0 && (
                        <span className='text-xs bg-purple-50 text-purple-600 border border-purple-100 rounded-full px-2 py-0.5'>
                            {sharedCourses.length} shared {sharedCourses.length === 1 ? 'course' : 'courses'}
                        </span>
                    )}
                    {sharedSubjects.length > 0 && (
                        <span className='text-xs bg-sky-50 text-sky-600 border border-sky-100 rounded-full px-2 py-0.5'>
                            {sharedSubjects.length} shared {sharedSubjects.length === 1 ? 'subject' : 'subjects'}
                        </span>
                    )}
                </div>
            )}

            <div className='flex mt-4 gap-2'>
                {/* Follow Button */}
                <button onClick={handleFollow} disabled={currentUser?.following.includes(user._id)} className='w-full py-3 rounded-md flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white cursor-pointer'>
                    <UserPlus className='w-4 h-4'/> {currentUser?.following.includes(user._id) ? 'Following' : 'Follow'}
                </button>

                {/* Connection Request Button / Message Button */}
                <button onClick={handleConnectionRequest} className='flex items-center justify-center w-16 border text-slate-500 group rounded-md cursor-pointer active:scale-95 transition'>
                    {
                        currentUser?.connections.includes(user._id) ? 
                        <MessageCircle className='w-f h-5 group-hover:scale-105 transition'/>
                        :
                        <Plus className='w-5 h-5 group-hover:scale-105 transition'/>
                    }
                </button>

            </div>
        </div>
    )
}

export default UserCard
