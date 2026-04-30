/*******************************************************************************
 * File:        EventDetailsModal.jsx
 * Description: Modal component that displays full event details and allows
 *              admins to edit or delete the event.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Calendar, MapPin, Eye, X } from 'lucide-react'
import api from '../api/axios'
import AvatarStack from './AvatarStack'

/*******************************************************************************
 * Function:    EventDetailsModal
 * Description: Renders a modal with event information and admin controls for
 *              updating or deleting the event via the API.
 * Input:       event (object) - event data to display
 *              setShowModal (function) - controls modal visibility
 *              isAdmin (boolean) - whether the current user is a group admin
 *              setEvents (function) - updates the parent event list
 *              setSelectedEvent (function) - clears the selected event on delete
 * Output:      Event updated or deleted via API
 * Return:      JSX.Element
 ******************************************************************************/
const EventDetailsModal = ({ event, setShowModal, isAdmin, setEvents, setSelectedEvent }) => {
    if (!event) return null

    const { userId, getToken } = useAuth()
    const isCancelled = event.status === 'cancelled'
    const hasRSVPed   = event.rsvp?.includes(userId)

    const [isEditing,    setIsEditing]    = useState(false)
    const [rsvpLoading,  setRsvpLoading]  = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)

    const [editForm, setEditForm] = useState({
        title:       event.title       || '',
        description: event.description || '',
        location:    event.location    || '',
        started_at:  event.started_at  || '',
        ended_at:    event.ended_at    || '',
    })

    useEffect(() => {
        if (event) {
            setEditForm({
                title:       event.title       || '',
                description: event.description || '',
                location:    event.location    || '',
                started_at:  event.started_at  || '',
                ended_at:    event.ended_at    || '',
            })
        }
    }, [event])

    const set = (key) => (e) => setEditForm(prev => ({ ...prev, [key]: e.target.value }))

    const handleRSVP = async () => {
        try {
            setRsvpLoading(true)
            const token = await getToken()
            const { data } = await api.post(
                `/api/event/${event._id}/rsvp`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            )
            if (data.success) {
                setSelectedEvent?.(data.event)
                setEvents?.(prev => prev.map(ev => ev._id === data.event._id ? data.event : ev))
            }
        } catch (err) {
            console.error(err)
        } finally {
            setRsvpLoading(false)
        }
    }

    const handleCancelEvent = async () => {
        try {
            const token = await getToken()
            const { data } = await api.patch(
                `/api/event/${event._id}/update`,
                { status: 'cancelled' },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            if (data.success) {
                setEvents(prev => prev.map(ev => ev._id === data.event._id ? data.event : ev))
                setSelectedEvent(data.event)
                setIsEditing(false)
                setShowModal(false)
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleSave = async () => {
        try {
            const token = await getToken()
            const { data } = await api.patch(
                `/api/event/${event._id}/update`,
                editForm,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            if (data.success) {
                setSelectedEvent(data.event)
                setEvents(prev => prev.map(ev => ev._id === data.event._id ? data.event : ev))
                setIsEditing(false)
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleDelete = async () => {
        try {
            const token = await getToken()
            const { data } = await api.delete(
                `/api/event/${event._id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            if (data.success) {
                setEvents(prev => prev.filter(ev => ev._id !== event._id))
                setSelectedEvent(null)
                setShowModal(false)
            }
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className='fixed top-0 bottom-0 left-0 right-0 z-110 h-screen overflow-y-scroll bg-black/50'>
            <div className='max-w-2xl sm:py-6 mx-auto'>
                <div className={`bg-white rounded-lg shadow p-6 ${isCancelled ? 'grayscale' : ''}`}>

                    {/* Header */}
                    <div className='flex items-start justify-between mb-6'>
                        <div className='flex-1 pr-4'>
                            {isCancelled && (
                                <span className='inline-block mb-2 text-xs font-bold uppercase bg-red-100 text-red-600 px-2 py-0.5 rounded-md'>
                                    Cancelled
                                </span>
                            )}
                            {isEditing && !isCancelled ? (
                                <input
                                    value={editForm.title}
                                    onChange={set('title')}
                                    className='w-full text-2xl font-bold text-gray-900 border-b-2 border-primary-300 outline-none pb-1'
                                />
                            ) : (
                                <h1 className='text-2xl font-bold text-gray-900'>{event.title}</h1>
                            )}
                            <span className={`inline-flex items-center gap-1 mt-2 text-xs font-medium px-2.5 py-1 rounded-full ${
                                event.visibility === 'public'
                                    ? 'bg-green-50 text-green-700'
                                    : 'bg-gray-100 text-gray-600'
                            }`}>
                                <Eye className='w-3 h-3' />
                                {event.visibility}
                            </span>
                        </div>
                        <button
                            onClick={() => { setIsEditing(false); setShowModal(false) }}
                            className='p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer'
                        >
                            <X className='w-5 h-5' />
                        </button>
                    </div>

                    {/* Flyer */}
                    {event.flyer_photo && (
                        <img src={event.flyer_photo} alt='event flyer' className='w-full h-48 object-cover rounded-lg mb-6' />
                    )}

                    {/* Info rows */}
                    <div className='space-y-3 mb-6'>
                        {isEditing && !isCancelled ? (
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Start</label>
                                <input
                                    type='datetime-local'
                                    value={editForm.started_at?.slice(0, 16)}
                                    onChange={set('started_at')}
                                    className='w-full p-3 border border-gray-200 rounded-lg text-sm'
                                />
                            </div>
                        ) : (
                            <div className='flex items-center gap-3 text-sm text-gray-600'>
                                <div className='w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0'>
                                    <Calendar className='w-4 h-4 text-primary-600' />
                                </div>
                                <span>{new Date(event.started_at).toLocaleString()}</span>
                            </div>
                        )}

                        {isEditing && !isCancelled ? (
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>End</label>
                                <input
                                    type='datetime-local'
                                    value={editForm.ended_at?.slice(0, 16) || ''}
                                    onChange={set('ended_at')}
                                    className='w-full p-3 border border-gray-200 rounded-lg text-sm'
                                />
                            </div>
                        ) : event.ended_at ? (
                            <div className='flex items-center gap-3 text-sm text-gray-500 pl-11'>
                                Ends {new Date(event.ended_at).toLocaleString()}
                            </div>
                        ) : null}

                        {isEditing && !isCancelled ? (
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Location</label>
                                <input
                                    value={editForm.location}
                                    onChange={set('location')}
                                    className='w-full p-3 border border-gray-200 rounded-lg text-sm'
                                    placeholder='e.g. Powell Library, Room 302'
                                />
                            </div>
                        ) : event.location ? (
                            <div className='flex items-center gap-3 text-sm text-gray-600'>
                                <div className='w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0'>
                                    <MapPin className='w-4 h-4 text-primary-600' />
                                </div>
                                <span>{event.location}</span>
                            </div>
                        ) : null}
                    </div>

                    {/* Description */}
                    {isEditing && !isCancelled ? (
                        <div className='mb-6'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Description</label>
                            <textarea
                                rows={3}
                                value={editForm.description}
                                onChange={set('description')}
                                className='w-full p-3 border border-gray-200 rounded-lg text-sm'
                                placeholder='What is this event about?'
                            />
                        </div>
                    ) : event.description ? (
                        <div className='mb-6'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>About this event</label>
                            <p className='text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-3'>{event.description}</p>
                        </div>
                    ) : null}

                    {/* RSVP row */}
                    <div className='flex items-center gap-3 mb-6'>
                        <AvatarStack userIds={event.rsvp || []} max={6} size='md' />
                        <span className='text-sm text-gray-500'>
                            {event.rsvp?.length ? `${event.rsvp.length} going` : 'No RSVPs yet'}
                        </span>
                    </div>

                    {/* Footer */}
                    {isEditing ? (
                        <div className='flex justify-between items-center pt-6 border-t border-gray-100'>
                            <button
                                onClick={handleCancelEvent}
                                className='px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 transition cursor-pointer'
                            >
                                Cancel Event
                            </button>
                            <div className='flex gap-3'>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50 transition cursor-pointer'
                                >
                                    Discard
                                </button>
                                <button
                                    onClick={handleSave}
                                    className='px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-lg text-sm font-medium hover:from-primary-600 hover:to-primary-800 transition cursor-pointer'
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className='flex justify-between items-center pt-6 border-t border-gray-100'>
                            {/* Left: admin actions */}
                            <div className='flex gap-2'>
                                {isAdmin && !isCancelled && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className='px-4 py-2 border border-primary-300 text-primary-600 rounded-lg text-sm hover:bg-primary-50 transition cursor-pointer'
                                    >
                                        Edit Event
                                    </button>
                                )}
                                {isAdmin && !confirmDelete && (
                                    <button
                                        onClick={() => setConfirmDelete(true)}
                                        className='px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 transition cursor-pointer'
                                    >
                                        Delete
                                    </button>
                                )}
                                {isAdmin && confirmDelete && (
                                    <>
                                        <button
                                            onClick={() => setConfirmDelete(false)}
                                            className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50 transition cursor-pointer'
                                        >
                                            Go Back
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className='px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition cursor-pointer'
                                        >
                                            Yes, Delete
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Right: RSVP + close */}
                            <div className='flex gap-2'>
                                {!isCancelled && (
                                    <button
                                        onClick={handleRSVP}
                                        disabled={rsvpLoading}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                                            rsvpLoading
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : hasRSVPed
                                                    ? 'bg-gradient-to-r from-primary-500 to-primary-700 text-white hover:from-primary-600 hover:to-primary-800'
                                                    : 'border border-primary-300 text-primary-600 hover:bg-primary-50'
                                        }`}
                                    >
                                        {rsvpLoading ? '...' : hasRSVPed ? '✓ Going' : 'RSVP'}
                                    </button>
                                )}
                                {!confirmDelete && (
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50 transition cursor-pointer'
                                    >
                                        Close
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Danger Zone — delete confirm inline */}
                    {isAdmin && confirmDelete && !isEditing && (
                        <div className='mt-4 bg-red-50 border border-red-200 rounded-lg p-4'>
                            <p className='text-sm text-red-700'>
                                Permanently delete <span className='font-semibold'>{event.title}</span>? This cannot be undone.
                            </p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}

export default EventDetailsModal
