/*******************************************************************************
 * File:        AvatarStack.jsx
 * Description: Reusable component that displays a row of overlapping user
 *              avatars fetched by Clerk user ID, with initials fallback and
 *              an overflow count badge.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import { useState, useEffect } from 'react'
import api from '../api/axios'

/*******************************************************************************
 * Function:    AvatarStack
 * Description: Fetches user profiles for the given IDs and renders overlapping
 *              avatar circles. Shows initials when no profile picture exists,
 *              and a "+N" badge when the list exceeds the max.
 * Input:       userIds (string[]) - Clerk user IDs to display
 *              max (number) - maximum avatars before showing overflow badge
 *              size (string) - 'sm' (28px) or 'md' (36px)
 * Output:      Rendered avatar stack with hover tooltips
 * Return:      JSX.Element | null
 ******************************************************************************/
const AvatarStack = ({ userIds = [], max = 5, size = 'sm' }) => {
    const [users, setUsers] = useState([])

    const key = userIds.slice().sort().join(',')

    useEffect(() => {
        if (!userIds?.length) {
            setUsers([])
            return
        }
        api.post('/api/user/by-ids', { userIds })
            .then(({ data }) => { if (data.success) setUsers(data.users) })
            .catch(console.error)
    }, [key])

    if (!users.length) return null

    const visible = users.slice(0, max)
    const overflow = users.length - max

    const ring = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'

    return (
        <div className="flex -space-x-2">
            {visible.map(user => (
                <div
                    key={user._id}
                    title={user.full_name}
                    className={`${ring} rounded-full border-2 border-white overflow-hidden bg-primary-200 flex items-center justify-center flex-shrink-0`}
                >
                    {user.profile_picture ? (
                        <img
                            src={user.profile_picture}
                            alt={user.full_name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="font-semibold text-primary-700 uppercase leading-none">
                            {user.full_name?.[0] || '?'}
                        </span>
                    )}
                </div>
            ))}

            {overflow > 0 && (
                <div className={`${ring} rounded-full border-2 border-white bg-gray-200 flex items-center justify-center font-semibold text-gray-600 flex-shrink-0`}>
                    +{overflow}
                </div>
            )}
        </div>
    )
}

export default AvatarStack
