import React from 'react'

const UpcomingEventBanner = ({ event, group, isAdmin, showGroupInfo }) => {

    const startTime = new Date(event.started_at)
    const isCancelled = event.status === "cancelled"

    return (
        <div className={`relative w-full h-56 rounded-2xl overflow-hidden shadow-lg transition
            ${isCancelled ? "opacity-50 grayscale" : ""}
        `}>


            
            {/* Background Image */}
            {event.flyer_photo && (
                <img
                    src={event.flyer_photo}
                    alt="event flyer"
                    className="absolute inset-0 w-full h-full object-cover"
                />
            )}

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-between p-5 text-white">

                {/* Top */}
                <div>
                    {isCancelled && (
                        <span className="text-xs font-bold uppercase bg-red-500 text-white px-2 py-1 rounded-md ml-2">
                            Cancelled
                        </span>
                    )}

                    <span className="text-xs font-semibold uppercase opacity-80">
                        ⏳ Upcoming Event
                    </span>

                    <h1 className="text-2xl md:text-3xl font-bold mt-1">
                        {event.title || "Untitled Event"}
                    </h1>

                    {/* Group Info */}
                    {showGroupInfo && group && (
                        <div className="mt-1 text-sm opacity-90">
                            📘 {group.name}
                        </div>
                    )}
                </div>

                {/* Bottom */}
                <div className="flex items-end justify-between">

                    {/* LEFT SIDE */}
                    <div className="flex flex-col gap-1">
                        
                        {/* Date + time */}
                        <div className="text-sm opacity-90">
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

                        {/* Location BELOW date */}
                        {event.location && (
                            <div className="text-sm opacity-90">
                                📍 {event.location}
                            </div>
                        )}
                    </div>

                    {/* RIGHT SIDE (button stays the same) */}
                    <button
                        disabled={isCancelled}
                        className={`font-semibold px-4 py-2 rounded-lg transition
                            ${isCancelled
                                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                                : isAdmin
                                    ? "bg-white text-black hover:bg-gray-200"
                                    : "bg-red-500 text-white hover:bg-red-600"
                            }`}
                    >
                        {isCancelled
                            ? "Cancelled"
                            : isAdmin
                                ? "Edit Event"
                                : "RSVP"
                        }
                    </button>

                </div>
            </div>
        </div>
    )
}

export default UpcomingEventBanner