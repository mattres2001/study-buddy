import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { dummyPostsData, dummyUserData } from '../assets/assets'
import Loading from '../components/Loading'

const GroupCard = () => {

    return user ? (
        <div className='relative h-full overflow-y-scroll bg-gray-50 p-6'>
         <div className='max-w-3xl mx-auto'> 
            {/* Profile Card */}
          <div className='bg-white rounded-2xl shadow overflow-hidden'>
            {/* Cover Photo */}
            <div className='h-40 md:h-56 bg-gradient-to-r from-indigo-200via-purple-200 to-pink-200'>
              {user.cover_photo && <img src={user.cover_photo} alt='' className='w-full h-full object-cover'/>}  
            </div>
             {/* User Info */}
             <UserProfileInfo user={user} posts={posts} profileId={profileID} 
             setShowEdit={setShowEdit}/>
          </div>

          {/* tabs */}
          <div className= 'mt-6'>
            <div className= 'bg-white rounded-xl shadow p-1 flex max-w-md mx-auto'>
                {["posts", "media", "likes"].map((tab)=>(
                    <button key={tab} className='flex-1 px-4 py-2 text-sm font-medium
                    rounded-lg transition-colors cursor-pointer ${activeTab === tab ?
                    "bg-indigo-600 text-white" : "text-gray-600 hover:text-gray-900"}'}>
                    {tab.chartAT(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>
          </div>
         </div>            
        </div>
    ) : (<Loading />)
}

export default GroupCard