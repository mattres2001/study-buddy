/*******************************************************************************
 * File:        GroupJoinRequests.jsx
 * Description: Admin-only panel that lists pending join requests for a group
 *              and allows approving or denying each one.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import api from '../api/axios'

/*******************************************************************************
 * Function:    GroupJoinRequests
 * Description: Fetches and displays pending join requests for a group. Admins
 *              can approve or deny each request; approved users are added to
 *              the member list.
 * Input:       group (object) - group data including _id
 *              onMemberAdded (function) - callback to refresh group after approval
 * Output:      Rendered join requests panel or null if no pending requests
 * Return:      JSX.Element | null
 ******************************************************************************/
const GroupJoinRequests = ({ group, onMemberAdded }) => {
    const { getToken } = useAuth()
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [handling, setHandling] = useState(null)

    useEffect(() => {
        const fetch = async () => {
            try {
                const token = await getToken()
                const { data } = await api.get(`/api/group/${group._id}/join-requests`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (data.success) setRequests(data.requests)
            } catch {
                // silently ignore
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [group._id])

    const handle = async (requestUserId, action) => {
        try {
            setHandling(requestUserId)
            const token = await getToken()
            const { data } = await api.post(
                `/api/group/${group._id}/join-request/${requestUserId}/handle`,
                { action },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            if (data.success) {
                setRequests(prev => prev.filter(r => r._id !== requestUserId))
                toast.success(data.message)
                if (action === 'approve') onMemberAdded?.()
            } else {
                toast.error(data.message)
            }
        } catch (err) {
            toast.error(err.message)
        } finally {
            setHandling(null)
        }
    }

    if (loading || requests.length === 0) return null

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-base font-semibold text-gray-800 mb-3">
                Join Requests
                <span className="ml-2 text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">
                    {requests.length}
                </span>
            </h2>

            <ul className="flex flex-col gap-2">
                {requests.map(user => (
                    <li key={user._id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-primary-100 flex-shrink-0">
                            {user.profile_picture ? (
                                <img src={user.profile_picture} alt={user.full_name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="w-full h-full flex items-center justify-center text-sm font-semibold text-primary-600 uppercase">
                                    {user.full_name?.[0]}
                                </span>
                            )}
                        </div>

                        {/* Name */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user.full_name}</p>
                            {user.username && (
                                <p className="text-xs text-gray-400">@{user.username}</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 flex-shrink-0">
                            <button
                                onClick={() => handle(user._id, 'approve')}
                                disabled={handling === user._id}
                                className="px-3 py-1 bg-primary-500 hover:bg-primary-600 text-white text-xs font-medium rounded-lg transition disabled:opacity-50"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => handle(user._id, 'deny')}
                                disabled={handling === user._id}
                                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-medium rounded-lg transition disabled:opacity-50"
                            >
                                Deny
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default GroupJoinRequests
