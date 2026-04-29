/*******************************************************************************
 * File:        MemberInviteModal.jsx
 * Description: Modal component for searching and inviting users to join a
 *              study group by sending a connection-based invite via the API.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import React, { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import api from '../api/axios'

/*******************************************************************************
 * Function:    MemberInviteModal
 * Description: Renders a search interface for finding users by name/username
 *              and inviting them to the group.
 * Input:       group (object) - the group to invite members into
 *              onClose (function) - callback to close the modal
 * Output:      Invite request sent via API on selection
 * Return:      JSX.Element
 ******************************************************************************/
const MemberInviteModal = ({ group, onClose }) => {
    const { getToken } = useAuth()
    const [email, setEmail] = useState('')
    const [connections, setConnections] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchConnections = async () => {
            try {
                const token = await getToken()

                const { data } = await api.get('/api/user/connections', {
                    headers: { Authorization: `Bearer ${token}` }
                })

                if (data.success) {
                    setConnections(data.connections)
                }
            } catch (err) {
                console.log(err)
            } finally {
                setLoading(false)
            }
        }

        fetchConnections()
    }, [])

    const groupMemberIds = new Set(group.members.map(m => m._id))

    const availableConnections = connections.filter(
        user => !groupMemberIds.has(user._id)
    )

    const handleInvite = async (userId) => {
        console.log("Invite user:", userId, "to group:", group._id)

        // later:
        // await api.post('/api/group/invite', { groupId, userId })
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-110">
            <div className="bg-white rounded-lg shadow p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">
                    Invite Members
                </h2>

                {loading ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                ) : availableConnections.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        No connections available to invite
                    </p>
                ) : (
                    <div className="space-y-2">
                        {availableConnections.map(user => (
                            <div
                                key={user._id}
                                className="flex items-center justify-between bg-gray-50 p-2 rounded"
                            >
                                <div className="flex items-center space-x-3">
                                    <img
                                        src={user.profile_picture || '/default-avatar.png'}
                                        className="w-8 h-8 rounded-full"
                                    />

                                    <div>
                                        <p className="text-sm font-medium">
                                            {user.full_name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            @{user.username}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleInvite(user._id)}
                                    className="text-sm px-3 py-1 bg-primary-500 text-white rounded"
                                >
                                    Invite
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-end mt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded-lg"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

export default MemberInviteModal