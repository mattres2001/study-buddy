import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import GroupBar from '../components/GroupBar'
import { Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { dummyUserData } from '../assets/assets'
import Loading from '../components/Loading'
import { useSelector } from 'react-redux'

const Layout = () => {
    
    const user = useSelector((state) => state.user.value)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [groupbarOpen, setGroupbarOpen] = useState(true)

    return user ? (
        <div className='w-full flex h-screen'>
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className='flex-1 bg-slate-50 pr-0'>
                <Outlet />
            </div>
            {/* Fixed GroupBar on the right (visible on large screens) */}
            <div className='hidden lg:block fixed right-0 top-0 h-screen z-40'>
                <GroupBar sidebarOpen={groupbarOpen} setSidebarOpen={setGroupbarOpen} />
            </div>
            {
                sidebarOpen 
                ? <X className='absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden' 
                onClick={()=> setSidebarOpen(false)}/>
                : <Menu className='absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden' 
                onClick={()=> setSidebarOpen(true)}/>
            }
        </div>
    ) : (
        <Loading />
    )
}

export default Layout