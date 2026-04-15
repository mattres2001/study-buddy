import React from 'react'
import { useAuth } from '@clerk/clerk-react'

const EventDetailsModal = ({ event, setShowModal, isAdmin }) => {
    if (!event) return null

    const { userId } = useAuth()

    const isCreator = userId === event.started_by
    const hasRSVPed = event.rsvps?.includes(userId)

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

                <div className="bg-white rounded-lg shadow p-6">

                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {event.title}
                        </h1>

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
                    <div className="text-sm text-gray-600 mb-3">
                        📅 {new Date(event.started_at).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                        {" – "}
                        {event.ended_at
                            ? new Date(event.ended_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                            })
                            : "Ongoing"}
                    </div>

                    {/* Location */}
                    {event.location && (
                        <div className="text-sm text-gray-600 mb-2">
                            📍 {event.location}
                        </div>
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

                    {/* Description */}
                    {event.description && (
                        <p className="text-gray-700 mb-4">
                            {event.description}
                        </p>
                    )}

                    {/* RSVP */}
                    <div className="text-sm text-gray-600 mb-6">
                        👥 {event.rsvp?.length || 0} RSVP{event.rsvp?.length !== 1 ? "s" : ""}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center pt-4 border-t">

                        {/* LEFT SIDE: ACTION BUTTONS */}
                        <div className="flex gap-2">

                            {/* EDIT (ADMIN ONLY) */}
                            {isAdmin && (
                                <button
                                    onClick={handleEdit}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Edit Event
                                </button>
                            )}

                            {/* RSVP (NOT CREATOR) */}
                            {!isCreator && (
                                <button
                                    onClick={handleRSVP}
                                    disabled={hasRSVPed}
                                    className={`px-4 py-2 rounded-lg ${
                                        hasRSVPed
                                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                            : "bg-green-600 text-white hover:bg-green-700"
                                    }`}
                                >
                                    {hasRSVPed ? "RSVPed" : "RSVP"}
                                </button>
                            )}
                        </div>

                        {/* RIGHT SIDE: CLOSE */}
                        <button
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Close
                        </button>

                    </div>

                </div>
            </div>
        </div>
    )
}

export default EventDetailsModal