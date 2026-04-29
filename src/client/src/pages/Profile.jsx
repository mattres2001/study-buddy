/*******************************************************************************
 * File:        Profile.jsx
 * Description: User profile page displaying profile info, posts, and group
 *              memberships for the authenticated user or a viewed user by
 *              profileId from the URL params.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { dummyUserData, dummyPostsData } from '../assets/assets'
import Loading from '../components/Loading'
import UserProfileInfo from '../components/UserProfileInfo'
import PostCard from '../components/PostCard'
import { Link } from 'react-router-dom'
import moment from 'moment'
import ProfileModal from '../components/ProfileModal'
import { useAuth } from '@clerk/clerk-react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import GroupBarItem from '../components/GroupBarItem'

/*******************************************************************************
 * Function:    Profile
 * Description: Renders a user profile page with cover photo, profile info,
 *              post grid, and group list. Loads the authenticated user's own
 *              profile or a visited user's profile based on the profileId param.
 * Input:       None (reads profileId from URL params and auth from Clerk)
 * Output:      Rendered user profile page with posts and groups
 * Return:      JSX.Element
 ******************************************************************************/
const Profile = () => {

    const currentUser = useSelector((state) => state.user.value)

    const { getToken } = useAuth()
    const { profileId } = useParams()
    const [ user, setUser ] = useState(null)
    const [ posts, setPosts ] = useState([])
    const [ groups, setGroups ] = useState([])
    const [ activeTab, setActiveTab ] = useState('posts')
    const [ showEdit, setShowEdit  ] = useState(false)

    const fetchUser = async (profileId) => {
        const token = await getToken()
        try {
            const { data } = await api.post('/api/user/profiles', { profileId }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                setUser(data.profile)
                setPosts(data.posts)
                setGroups(data.groups)
                console.log(data.groups)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (profileId) {
            fetchUser(profileId)
        } else {
            fetchUser(currentUser._id)
        }
    }, [profileId, currentUser])

    return user ? (
        <div className='relative h-full overflow-y-scroll bg-gray-50 p-6'>
            <div className='max-w-3xl mx-auto'>
                {/* Profile Card */}
                <div className='bg-white rounded-2xl shadow overflow-hidden'>

                    {/* Cover Photo */}
                    <div className='h-40 md:h-56 bg-gradient-to-r from-primary-200 via-primary-200 to-pink-200'>
                        {user.cover_photo && <img src={user.cover_photo} alt="" className='w-full h-full object-cover'/>}
                    </div>

                    {/* User Info */}
                    <UserProfileInfo user={user} posts={posts} profileId={profileId} setShowEdit={setShowEdit} />

                    {/* User Groups */}
                    <div className="mt-6 bg-gradient-to-br from-white to-gray-50 rounded-b-2xl rounded-t-none shadow-lg border border-gray-200 p-5">

                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {user.name || "User"}'s Groups
                            </h2>

                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {groups?.length || 0} groups
                            </span>
                        </div>

                        {user.groups?.length === 0 ? (
                            <div className="text-sm text-gray-500 py-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                No groups yet
                            </div>
                        ) : (
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                {groups?.map(group => (
                                    <GroupBarItem
                                        key={group._id}
                                        group={group}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Tabs
                    <div className='mt-6'>
                        <div className='bg-white rounded-xl shadow p-1 flex max-w-md mx-auto'>
                            {["posts", "media", "likes"].map((tab) => (
                                <button onClick={() => setActiveTab(tab)} key={tab} className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${activeTab === tab ? "bg-primary-600 text-white" : "text-gray-600 hover:text-gray-900"}`}>
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div> */}

                        {/* Posts */}
                        {/* {activeTab === 'posts' && (
                            <div className='mt--6 flex flex-col items-center gap-6'>
                                {posts.map((post) => <PostCard key={post._id} post={post}/>)}
                            </div>
                        )} */}

                        {/* Media */}
                        {/* {activeTab === 'media' && (
                            <div className='flex flex-wrap mt-6 max-w-6xl'>
                                {
                                    posts.filter((post) => post.image_urls.length > 0).map((post) => (
                                        <>
                                            {post.image_urls.map((image, index) => (
                                                <Link target='_blank' to={image} key={index} className='relative group'>
                                                    <img src={image} key={index} className='w-64 aspect-video object-cover' alt="" />
                                                    <p className='absolute bottom-0 right-0 text-xs p-1 px-3 backdrop-blur-xl text-white opacity-0 group-hover:opacity-100 transition duration-300'>Posted {moment(post.createdAt).fromNow()}</p>
                                                </Link>
                                            ))}
                                        </>
                                    ))
                                }
                            </div>
                        )}
                    </div> */}
                </div>
            </div>
            {/* Edit Profile Modal */}
            {showEdit && <ProfileModal setShowEdit={setShowEdit}/>}
        </div>
    ) : (<Loading />)
}

export default Profile