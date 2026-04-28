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
import React, { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import api from '../api/axios'

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
    const isCreator = userId === event.started_by
    const hasRSVPed = event.rsvps?.includes(userId)
    const isCancelled = event.status === "cancelled"

    const [isEditing, setIsEditing] = useState(false)

    const [editForm, setEditForm] = useState({
        title: event.title || "",
        description: event.description || "",
        location: event.location || "",
        started_at: event.started_at || "",
        ended_at: event.ended_at || ""
    })

    useEffect(() => {
        if (event) {
            setEditForm({
                title: event.title || "",
                description: event.description || "",
                location: event.location || "",
                started_at: event.started_at || "",
                ended_at: event.ended_at || ""
            })
        }
    }, [event])
    
    const handleRSVP = async () => {
        try {
        await api.post(`/events/${event._id}/rsvp`)
        // ideally refetch or update state here
        } catch (err) {
        console.error(err)
        }
    }

    const handleEdit = () => {
        // open edit modal or route to edit page
    }


    return (
        <div className="fixed inset-0 z-50 h-screen overflow-y-auto bg-black/50">
            <div className="max-w-2xl sm:py-10 mx-auto">

                <div className={`bg-white rounded-lg shadow p-6 transition
                    ${isCancelled ? " grayscale" : ""}
                `}>

                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        {isCancelled && (
                            <span className="ml-2 text-xs font-bold uppercase bg-red-500 text-white px-2 py-1 rounded-md">
                                Cancelled
                            </span>
                        )}

                        {isEditing && !isCancelled ? (
                            <input
                                value={editForm.title}
                                onChange={(e) =>
                                    setEditForm(prev => ({ ...prev, title: e.target.value }))
                                }
                                className="w-full text-2xl font-bold border-b border-gray-300 outline-none"
                            />
                        ) : (
                            <h1 className="text-2xl font-bold text-gray-900">
                                {event.title}
                            </h1>
                        )}

                        <button
                            onClick={() => setShowModal(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Flyer */}
                    {event.flyer_photo && (
                        <img
                            src={event.flyer_photo}
                            alt="event flyer"
                            className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                    )}

                    {/* Date + Time */}
                    {isEditing && !isCancelled ? (
                        <input
                            type="datetime-local"
                            value={editForm.started_at?.slice(0, 16)}
                            onChange={(e) =>
                                setEditForm(prev => ({
                                    ...prev,
                                    started_at: e.target.value
                                }))
                            }
                            className="border border-gray-200 rounded-md p-2"
                        />
                    ) : (
                        <div className="text-sm text-gray-600 mb-3">
                            📅 {new Date(event.started_at).toLocaleString()}
                        </div>
                    )}

                    {/* End Date + Time */}
                    {isEditing && !isCancelled ? (
                        <input
                            type="datetime-local"
                            value={editForm.ended_at?.slice(0, 16) || ""}
                            onChange={(e) =>
                                setEditForm(prev => ({
                                    ...prev,
                                    ended_at: e.target.value
                                }))
                            }
                            className="border border-gray-200 rounded-md p-2"
                        />
                    ) : (
                        <div className="text-sm text-gray-600 mb-3">
                            ⏱️ Ends:{" "}
                            {event.ended_at
                                ? new Date(event.ended_at).toLocaleString()
                                : "Not set"}
                        </div>
                    )}

                    {/* Location */}
                    {isEditing && !isCancelled? (
                        <input
                            value={editForm.location}
                            onChange={(e) =>
                                setEditForm(prev => ({ ...prev, location: e.target.value }))
                            }
                            className="w-full border border-gray-200 rounded-md p-2"
                        />
                    ) : (
                        event.location && (
                            <div className="text-sm text-gray-600 mb-2">
                                📍 {event.location}
                            </div>
                        )
                    )}

                    {/* Visibility */}
                    <div className="mb-2">
                        <span className={`text-sm px-3 py-1 rounded-full ${
                            event.visibility === "public"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-700"
                        }`}>
                            {event.visibility}
                        </span>
                    </div>

                    {isEditing && !isCancelled ? (
                        <textarea
                            value={editForm.description}
                            onChange={(e) =>
                                setEditForm(prev => ({ ...prev, description: e.target.value }))
                            }
                            className="w-full border border-gray-200 rounded-md p-2"
                        />
                    ) : (
                        event.description && (
                            <p className="text-gray-700 mb-4">
                                {event.description}
                            </p>
                        )
                    )}

                    {/* RSVP */}
                    <div className="text-sm text-gray-600 mb-6">
                        👥 {event.rsvp?.length || 0} RSVP{event.rsvp?.length !== 1 ? "s" : ""}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center pt-4 border-t">

                        {isEditing ? (
                            <div className="flex gap-2 justify-end w-full">

                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 bg-gray-200 rounded-lg"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={async () => {
                                        try {
                                            const token = await getToken()

                                            const { data } = await api.patch(
                                                `/api/event/${event._id}/update`,
                                                { status: "cancelled" },
                                                {
                                                    headers: {
                                                        Authorization: `Bearer ${token}`
                                                    }
                                                }
                                            )

                                            if (data.success) {
                                                // update dashboard list
                                                setEvents(prev =>
                                                    prev.map(ev =>
                                                        ev._id === data.event._id ? data.event : ev
                                                    )
                                                )

                                                // update modal state
                                                setSelectedEvent(data.event)

                                                setIsEditing(false)
                                                setShowModal(false)
                                            }

                                        } catch (err) {
                                            console.error(err)
                                        }
                                    }}
                                    className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800"
                                >
                                    Cancel Event
                                </button>

                                <button
                                    onClick={async () => {
                                        try {
                                            const token = await getToken()

                                            const { data } = await api.patch(
                                                `/api/event/${event._id}/update`,
                                                editForm,
                                                {
                                                    headers: {
                                                        Authorization: `Bearer ${token}`
                                                    }
                                                }
                                            )

                                            if (data.success) {
                                                setSelectedEvent(data.event)

                                                setEvents(prev =>
                                                    prev.map(ev =>
                                                        ev._id === data.event._id ? data.event : ev
                                                    )
                                                )
                                                setIsEditing(false)
                                            }

                                        } catch (err) {
                                            console.error(err)
                                        }
                                    }}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg"
                                >
                                    Save
                                </button>

                            </div>
                        ) : (
                            <>
                            {/* LEFT SIDE: ACTION BUTTONS */}
                            <div className="flex gap-2">

                                {/* EDIT (ADMIN ONLY) */}
                                {isAdmin && !isCancelled && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Edit Event
                                    </button>
                                )}

                                {isAdmin && (
                                    <button
                                        onClick={async () => {
                                            const confirmDelete = window.confirm(
                                                "This will permanently delete this event. Continue?"
                                            )

                                            if (!confirmDelete) return

                                            try {
                                                const token = await getToken()

                                                const { data } = await api.delete(
                                                    `/api/event/${event._id}`,
                                                    {
                                                        headers: {
                                                            Authorization: `Bearer ${token}`
                                                        }
                                                    }
                                                )

                                                if (data.success) {
                                                    // remove from dashboard list
                                                    setEvents(prev =>
                                                        prev.filter(ev => ev._id !== event._id)
                                                    )

                                                    setSelectedEvent(null)
                                                    setShowModal(false)
                                                }

                                            } catch (err) {
                                                console.error(err)
                                            }
                                        }}
                                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900"
                                    >
                                        Delete Event
                                    </button>
                                )}

                                {/* RSVP (NOT CREATOR) */}
                                <button
                                    onClick={handleRSVP}
                                    disabled={hasRSVPed || isCancelled}
                                    className={`px-4 py-2 rounded-lg transition ${
                                        hasRSVPed || isCancelled
                                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                            : "bg-red-50 text-red-600 hover:bg-red-100"
                                    }`}
                                >
                                    {isCancelled
                                        ? "Cancelled"
                                        : hasRSVPed
                                            ? "RSVPed"
                                            : "RSVP"}
                                </button>
                                
                            </div>

                            {/* RIGHT SIDE: CLOSE */}
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Close
                            </button>
                            </>
                        )}




                    </div>

                </div>
            </div>
        </div>
    )
}

export default EventDetailsModal