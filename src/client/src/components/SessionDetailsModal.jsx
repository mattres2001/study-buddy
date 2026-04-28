/*******************************************************************************
 * File:        SessionDetailsModal.jsx
 * Description: Modal component displaying full details of a study session
 *              with options to join, end, or update the session vibe.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import React from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '@clerk/clerk-react'
import api from '../api/axios.js'

/*******************************************************************************
 * Function:    SessionDetailsModal
 * Description: Renders a modal with full session details and controls for
 *              joining, ending, and updating the vibe of a study session.
 * Input:       session (object) - session data to display
 *              setSessions (function) - updates the session list in the parent
 *              setShowModal (function) - controls modal visibility
 *              isAdmin (boolean) - whether the current user can end the session
 * Output:      Session joined or ended via API; modal state updated
 * Return:      JSX.Element
 ******************************************************************************/
const SessionDetailsModal = ({ session, setSessions, setShowModal, isAdmin }) => {

    const { getToken } = useAuth()

    if (!session) return null

    return (
        <div className='fixed inset-0 z-50 h-screen overflow-y-auto bg-black/50'>
            <div className='max-w-2xl sm:py-10 mx-auto'>

                <div className='bg-white rounded-lg shadow p-6'>

                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <h1 className='text-2xl font-bold text-gray-900'>
                            {session.title}
                        </h1>

                        <button
                            onClick={() => setShowModal(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Date + Time */}
                    <div className="text-sm text-gray-600 mb-4">
                        📅 {new Date(session.started_at).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                        {" – "}
                        {new Date(session.ended_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>

                    {/* Location */}
                    {session.location && (
                        <div className="text-sm text-gray-600 mb-2">
                            📍 {session.location}
                        </div>
                    )}

                    {/* Description */}
                    {session.description && (
                        <div className="text-gray-700 mb-4">
                            {session.description}
                        </div>
                    )}

                    {/* Vibe */}
                    {session.vibe && (
                        <div className="mb-4">
                            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
                                {session.vibe.emoji || "✨"} {session.vibe.vibe}
                            </span>
                        </div>
                    )}

                    {/* Participants */}
                    <div className="mb-6 text-sm text-gray-600">
                        👥 {session.participants?.length || 0} participants
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">

                        <button
                            onClick={() => setShowModal(false)}
                            className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50'
                        >
                            Close
                        </button>

                        {isAdmin && (
                            <button
                                onClick={async () => {
                                    try {
                                        const token = await getToken()
                                        const { data } = await api.post(
                                            `/api/session/${session._id}/end`,
                                            {},
                                            {
                                                headers: {
                                                    Authorization: `Bearer ${token}`
                                                }
                                            }
                                        )

                                        if (data.success) {
                                            toast.success("Session ended")
                                            setSessions(prev =>
                                                prev.filter(s => s._id !== session._id)
                                            )
                                            setShowModal(false)
                                        } else {
                                            toast.error(data.message)
                                        }
                                    } catch (error) {
                                        toast.error(error.message)
                                    }
                                }}
                                className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700'
                            >
                                Cancel Session
                            </button>
                        )}

                    </div>

                </div>
            </div>
        </div>
    )
}

export default SessionDetailsModal