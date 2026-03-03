import React from 'react'
import { useSelector } from 'react-redux'
import GroupCircle from './GroupCircle'

const GroupBar = ({sidebarOpen, setSidebarOpen}) => {
    
    const user = useSelector((state) => state.user.value)

    const groups = user?.groups || []

    return (
        <div className={`w-60 xl:w-72 min-w-60 xl:min-w-72 bg-white border border-gray-200 flex-none flex flex-col
                justify-between items-center h-full z-20 transition-all duration-300 east-in-out
                ${sidebarOpen ? 'max-sm:absolute top-0 bottom-0 translate-x-0' : 'max-sm:hidden'}`}>
            {/* always render wrapper even if groups empty */}
            <div className='w-full flex flex-col items-center gap-4 py-4'>
                {groups.length > 0 ? (
                    groups.map((g) => (
                        <GroupCircle key={g._id} group={g} />
                    ))
                ) : (
                    <p className='text-sm text-gray-500'>No groups yet</p>
                )}
            </div>
        </div>
    )
}

export default GroupBar
