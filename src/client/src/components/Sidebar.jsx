/*******************************************************************************
 * File:        Sidebar.jsx
 * Description: Main application sidebar containing the logo, navigation menu,
 *              group bar, user avatar, and sign-out control.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import React, { useState } from 'react'
import { assets, dummyUserData } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import MenuItems from './MenuItems'
import { CirclePlus, LogOut } from 'lucide-react'
import { UserButton, useClerk} from '@clerk/clerk-react'
import { useSelector } from 'react-redux'
import CreateEventModal from './CreateEventModal'
import CreateSessionModal from './CreateSessionModal'

/*******************************************************************************
 * Function:    Sidebar
 * Description: Renders the main application sidebar with logo, navigation
 *              links, group list, user avatar, and a sign-out button.
 * Input:       sidebarOpen (boolean) - whether the sidebar is expanded
 *              setSidebarOpen (function) - toggles sidebar open/closed state
 * Output:      Rendered sidebar navigation panel
 * Return:      JSX.Element
 ******************************************************************************/
const Sidebar = ({sidebarOpen, setSidebarOpen}) => {
    
    const navigate = useNavigate()
    const user = useSelector((state) => state.user.value)
    const { signOut } = useClerk()
    const [ showModal, setShowModal ] = useState(false)

    return (
        <div className={`w-64 xl:w-76 bg-gray-50 border-r border-gray-200 flex flex-col
            justify-between items-center max-sm:absolute top-0 bottom-0 z-20
            ${sidebarOpen ? 'translate-x-0' : 'max-sm:-translate-x-full'} transition-all
            duration-300 ease-in-out`}>
            <div className='w-full'>
                <div className='px-6 pt-5 pb-4'>
                    <img onClick={() => navigate('/')} src={assets.logo} className='w-28 cursor-pointer' alt='' />
                </div>
                <div className='h-px bg-gray-200 mx-4 mb-4' />

                <MenuItems setSidebarOpen={setSidebarOpen}/>

                <div className='px-4 mt-5'>
                    <button
                        onClick={() => setShowModal(true)}
                        className='w-full flex items-center justify-center gap-2 py-3
                            rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700
                            hover:from-primary-600 hover:to-primary-800 active:scale-95
                            transition-all duration-200 text-white font-semibold shadow-md
                            hover:shadow-lg text-sm cursor-pointer'
                    >
                        <CirclePlus className='w-5 h-5'/>
                        Start Study Session
                    </button>
                </div>
            </div>

            <div className='w-full p-4'>
                <div className='bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3 flex items-center justify-between'>
                    <div className='flex gap-3 items-center cursor-pointer'>
                        <UserButton />
                        <div>
                            <h1 className='text-sm font-semibold text-gray-800'>{ user.full_name }</h1>
                            <p className='text-xs text-gray-400'>@{ user.username }</p>
                        </div>
                    </div>
                    <LogOut onClick={ signOut } className='w-4 h-4 text-gray-400 hover:text-primary-500 transition cursor-pointer'/>
                </div>
            </div>

            {showModal && <CreateSessionModal
                groups={user.groups}
                setShowModal={setShowModal}
            />}
        </div>
    )
}

export default Sidebar