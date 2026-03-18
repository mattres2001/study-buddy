import React, { useState } from 'react'

const GroupEvents = ({ group, events, isAdmin = true }) => {
    
    // Create event modal state
    const [ showModal, setShowModal ] = useState(false)


    return (
        <div className="bg-white rounded-lg shadow p-4 w-1/2">
        {/* Header */}
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">Upcoming Events</h2>

                {/* Admin Add Event button */}
                {isAdmin && (
                <button
                    className="bg-indigo-500 text-white text-sm px-3 py-1 rounded hover:bg-indigo-600 transition"
                >
                    Add Event
                </button>
                )}
            </div>

            {/* Meetings list */}
            <div className="flex flex-col space-y-2 max-h-[60vh] overflow-y-auto">
                {events && events.length > 0 ? (
                events.map(events => (
                    <div
                        key={events._id}
                        className="flex flex-col bg-gray-50 rounded px-3 py-2 shadow-sm hover:bg-gray-100 transition cursor-pointer"
                    >
                    <span className="font-medium text-base truncate" title={events.title}>
                        {events.title}
                    </span>
                    <span className="text-sm text-gray-500 truncate" title={new Date(events.started_at).toLocaleString()}>
                        {new Date(events.started_at).toLocaleString()}
                    </span>
                    {events.location && (
                        <span className="text-sm text-gray-500 truncate" title={events.location}>
                        📍 {events.location}
                        </span>
                    )}
                    </div>
                ))
                ) : (
                <p className="text-gray-500 text-sm">No upcoming events</p>
                )}
            </div>
        </div>
    )
}

export default GroupEvents
