/*******************************************************************************
 * File:        GroupCard.jsx
 * Description: Card component displaying a group's cover photo, picture,
 *              name, member count, and join/view controls.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import banner from '../assets/sample_cover.jpg'

/*******************************************************************************
 * Function:    GroupCard
 * Description: Renders a styled card with the group's banner, avatar, name,
 *              member count, and action buttons. Shows "Member", "Requested",
 *              or "Request to Join" depending on the user's relationship to
 *              the group.
 * Input:       group (object) - group data from the API
 * Output:      Rendered group card UI
 * Return:      JSX.Element
 ******************************************************************************/
const GroupCard = ({ group }) => {
    const navigate  = useNavigate()
    const { userId, getToken } = useAuth()

    const cover       = group.cover_photo || group.cover || banner
    const memberCount = group.members?.length ?? group.memberCount ?? 0

    const isMember    = group.members?.includes(userId)
    const [requested, setRequested] = useState(group.joinRequests?.includes(userId) ?? false)
    const [loading, setLoading]     = useState(false)

    const handleRequestJoin = async (e) => {
        e.stopPropagation()
        try {
            setLoading(true)
            const token = await getToken()
            const { data } = await api.post(
                `/api/group/${group._id}/join-request`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            )
            if (data.success) {
                setRequested(true)
                toast.success('Join request sent')
            } else {
                toast.error(data.message)
            }
        } catch (err) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-xl shadow overflow-hidden w-72 flex flex-col">
            {/* Cover */}
            <div className="relative h-32">
                <img
                    src={cover}
                    alt={group.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = banner }}
                />
                {group.group_picture && (
                    <div className="absolute -bottom-5 left-4">
                        <img
                            src={group.group_picture}
                            alt={group.name}
                            className="w-10 h-10 rounded-full border-2 border-white object-cover"
                        />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className={`p-4 flex flex-col gap-2 flex-1 ${group.group_picture ? 'pt-7' : ''}`}>
                <h2 className="text-base font-semibold text-gray-900 leading-tight">{group.name}</h2>

                {group.subject && (
                    <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full w-fit">
                        {group.subject}
                    </span>
                )}

                {group.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">{group.description}</p>
                )}

                <p className="text-xs text-gray-400">{memberCount} member{memberCount !== 1 ? 's' : ''}</p>

                <div className="mt-auto flex gap-2">
                    <button
                        onClick={() => navigate(`/group/${group._id}`)}
                        className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg py-2 text-sm font-medium transition"
                    >
                        View
                    </button>

                    {isMember ? (
                        <button
                            disabled
                            className="flex-1 bg-green-100 text-green-700 rounded-lg py-2 text-sm font-medium cursor-default"
                        >
                            ✓ Member
                        </button>
                    ) : requested ? (
                        <button
                            disabled
                            className="flex-1 bg-gray-100 text-gray-500 rounded-lg py-2 text-sm font-medium cursor-default"
                        >
                            Requested
                        </button>
                    ) : (
                        <button
                            onClick={handleRequestJoin}
                            disabled={loading}
                            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white rounded-lg py-2 text-sm font-medium transition disabled:opacity-50"
                        >
                            {loading ? '...' : 'Join'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default GroupCard
