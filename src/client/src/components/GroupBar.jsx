import React from 'react'
import { useSelector } from 'react-redux'

const GroupBar = ({sidebarOpen, setSidebarOpen}) => {
    
    const user = useSelector((state) => state.user.value)

    return (
        <div className={`w-60 x1:w-72 bg-white border-r border-gray-200 flex flex-col 
            justify-between items-center max-sm:absolute top-0 bottom-0 z-20 
            ${sidebarOpen ? 'translate-x-0' : 'max-sm:-translate-x-full'} transition-all
            duration-300 east-in-out`}>
            
            <div className='w-full'>
                
            </div>
        </div>
    )
}

export default GroupBar
