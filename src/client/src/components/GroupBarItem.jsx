/*******************************************************************************
 * File:        GroupBarItem.jsx
 * Description: Individual group item component rendered inside GroupBar,
 *              displaying the group picture and name with selection state and
 *              a live session indicator with hover tooltip.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import { useState } from 'react'
import { assets } from '../assets/assets.js'
import { useNavigate } from 'react-router-dom'

/*******************************************************************************
 * Function:    GroupBarItem
 * Description: Renders a single clickable group entry with avatar, name, and
 *              an online-style green dot when active sessions exist. Hovering
 *              while active shows a tooltip listing each session title and time.
 * Input:       group (object) - group data (name, group_picture, cover_photo)
 *              onSelect (function) - callback when the item is selected
 *              isSelected (boolean) - highlights the item if currently active
 *              activeSessions (array) - live/starting-soon sessions for this group
 * Output:      Rendered group list item
 * Return:      JSX.Element
 ******************************************************************************/
const GroupBarItem = ({ group, onSelect, isSelected, activeSessions = [] }) => {
    const profile  = group?.group_picture || assets.sample_profile
    const name     = group?.name          || 'Study Group'
    const navigate = useNavigate()
    const [hovered, setHovered] = useState(false)

    const isActive = activeSessions.length > 0

    const handleClick = () => {
        if (onSelect) onSelect(group)
        else navigate(`/group/${group._id}`)
    }

    return (
        <div
            className="relative w-full"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div
                onClick={handleClick}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150
                    ${isSelected
                        ? 'bg-white shadow-sm border border-gray-100 text-primary-600'
                        : 'text-gray-600 hover:bg-white hover:shadow-sm hover:text-gray-800'}`}
            >
                {/* Avatar with live dot */}
                <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                        <img src={profile} alt={name} className="w-full h-full object-cover" />
                    </div>
                    {isActive && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full animate-pulse z-10" />
                    )}
                </div>

                {/* Name + live label */}
                <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${isSelected ? 'font-semibold' : 'font-medium'}`}>{name}</p>
                    {isActive && (
                        <p className="text-xs text-green-600 font-medium leading-tight">Live</p>
                    )}
                </div>
            </div>

            {/* Tooltip */}
            {isActive && hovered && (
                <div className="absolute right-full top-0 mr-3 w-52 bg-gray-900 text-white text-xs rounded-xl shadow-xl p-3 z-50 pointer-events-none">
                    <p className="font-semibold text-green-400 mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                        Active Sessions
                    </p>
                    <ul className="flex flex-col gap-2">
                        {activeSessions.slice(0, 3).map(s => (
                            <li key={s._id}>
                                <p className="font-medium truncate">{s.title || 'Untitled Session'}</p>
                                <p className="text-gray-400">
                                    {new Date(s.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {' – '}
                                    {new Date(s.ended_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </li>
                        ))}
                        {activeSessions.length > 3 && (
                            <li className="text-gray-500">+{activeSessions.length - 3} more</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    )
}

export default GroupBarItem
