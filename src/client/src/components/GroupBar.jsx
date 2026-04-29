/*******************************************************************************
 * File:        GroupBar.jsx
 * Description: Sidebar panel that lists the user's groups as selectable items
 *              using GroupBarItem, reading group data from the Redux store.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useAuth } from '@clerk/clerk-react'
import GroupBarItem from './GroupBarItem'
import api from '../api/axios'

/*******************************************************************************
 * Function:    GroupBar
 * Description: Renders a collapsible list of the user's groups in the sidebar,
 *              polling for active sessions to show a live status indicator.
 * Input:       sidebarOpen (boolean) - whether the sidebar is expanded
 *              setSidebarOpen (function) - toggles sidebar state
 * Output:      Rendered group list panel
 * Return:      JSX.Element
 ******************************************************************************/
const GroupBar = ({ sidebarOpen }) => {

    const user = useSelector((state) => state.user.value)
    const { getToken } = useAuth()
    const [sessionsByGroup, setSessionsByGroup] = useState({})

    const groups = user?.groups || []

    useEffect(() => {
        if (!groups.length) return

        const fetchActive = async () => {
            try {
                const token = await getToken()
                const { data } = await api.get('/api/session/active-by-group', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (data.success) setSessionsByGroup(data.sessionsByGroup)
            } catch {
                // non-critical — silently ignore
            }
        }

        fetchActive()
        const interval = setInterval(fetchActive, 60_000)
        return () => clearInterval(interval)
    }, [groups.length, getToken])

    return (
        <div className={`
            fixed xl:static top-0 right-0 bottom-0
            w-64 xl:w-72 min-w-64 xl:min-w-72
            bg-gray-50 border-l border-gray-200
            flex flex-col
            h-full z-40 overflow-visible
            transition-transform duration-300
            ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
            xl:translate-x-0 flex-shrink-0
        `}>
            <div className='px-5 pt-5 pb-3'>
                <h2 className='text-xs font-semibold text-gray-400 uppercase tracking-wider'>My Groups</h2>
            </div>
            <div className='h-px bg-gray-200 mx-4 mb-3' />

            <div className='flex flex-col gap-1 px-4'>
                {groups.length > 0 ? (
                    groups.map((g) => (
                        <GroupBarItem
                            key={g._id}
                            group={g}
                            activeSessions={sessionsByGroup[g._id] || []}
                        />
                    ))
                ) : (
                    <p className='text-sm text-gray-400 text-center py-6'>No groups yet</p>
                )}
            </div>
        </div>
    )
}

export default GroupBar
