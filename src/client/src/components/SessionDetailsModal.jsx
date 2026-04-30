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
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '@clerk/clerk-react'
import { Calendar, MapPin, Users, X } from 'lucide-react'
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
    const [confirmCancel, setConfirmCancel] = useState(false)

    if (!session) return null

    const startDate = new Date(session.started_at)
    const endDate   = new Date(session.ended_at)

    const fmt = (d) => d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    const fmtTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const handleEnd = async () => {
        try {
            const token = await getToken()
            const { data } = await api.post(
                `/api/session/${session._id}/end`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            )
            if (data.success) {
                toast.success('Session ended')
                setSessions(prev => prev.filter(s => s._id !== session._id))
                setShowModal(false)
            } else {
                toast.error(data.message)
            }
        } catch (err) {
            toast.error(err.message)
        }
    }

    return (
        <div className='fixed top-0 bottom-0 left-0 right-0 z-110 h-screen overflow-y-scroll bg-black/50'>
            <div className='max-w-2xl sm:py-6 mx-auto'>
                <div className='bg-white rounded-lg shadow p-6'>

                    {/* Header */}
                    <div className='flex items-start justify-between mb-6'>
                        <div>
                            <h1 className='text-2xl font-bold text-gray-900'>{session.title}</h1>
                            {session.vibe && (
                                <span className='inline-flex items-center gap-1.5 mt-2 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-medium'>
                                    {session.vibe.emoji || '✨'} {session.vibe.vibe}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => setShowModal(false)}
                            className='p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer'
                        >
                            <X className='w-5 h-5' />
                        </button>
                    </div>

                    {/* Info rows */}
                    <div className='space-y-3 mb-6'>
                        <div className='flex items-center gap-3 text-sm text-gray-600'>
                            <div className='w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0'>
                                <Calendar className='w-4 h-4 text-primary-600' />
                            </div>
                            <span>{fmt(startDate)} – {fmtTime(endDate)}</span>
                        </div>

                        {session.location && (
                            <div className='flex items-center gap-3 text-sm text-gray-600'>
                                <div className='w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0'>
                                    <MapPin className='w-4 h-4 text-primary-600' />
                                </div>
                                <span>{session.location}</span>
                            </div>
                        )}

                        <div className='flex items-center gap-3 text-sm text-gray-600'>
                            <div className='w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0'>
                                <Users className='w-4 h-4 text-primary-600' />
                            </div>
                            <span>{session.participants?.length || 0} participant{session.participants?.length !== 1 ? 's' : ''}</span>
                        </div>
                    </div>

                    {/* Description */}
                    {session.description && (
                        <div className='mb-6'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>About this session</label>
                            <p className='text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-3'>{session.description}</p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className='flex justify-end gap-3 pt-6 border-t border-gray-100'>
                        {isAdmin && !confirmCancel && (
                            <button
                                onClick={() => setConfirmCancel(true)}
                                className='px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 transition cursor-pointer'
                            >
                                Cancel Session
                            </button>
                        )}

                        {isAdmin && confirmCancel && (
                            <>
                                <p className='text-sm text-red-600 self-center mr-auto'>End this session for everyone?</p>
                                <button
                                    onClick={() => setConfirmCancel(false)}
                                    className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50 transition cursor-pointer'
                                >
                                    Go Back
                                </button>
                                <button
                                    onClick={handleEnd}
                                    className='px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition cursor-pointer'
                                >
                                    Yes, End Session
                                </button>
                            </>
                        )}

                        {!confirmCancel && (
                            <button
                                onClick={() => setShowModal(false)}
                                className='px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-lg hover:from-primary-600 hover:to-primary-800 transition cursor-pointer'
                            >
                                Close
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    )
}

export default SessionDetailsModal
