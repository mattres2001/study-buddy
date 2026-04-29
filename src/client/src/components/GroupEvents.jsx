/*******************************************************************************
 * File:        GroupEvents.jsx
 * Description: Component that fetches and displays a group's events list,
 *              with admin controls for creating and managing events.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import React, { useState, useEffect } from 'react'
import CreateEventModal from './CreateEventModal'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import EventDetailsModal from './EventDetailsModal'

/*******************************************************************************
 * Function:    GroupEvents
 * Description: Fetches and renders the list of events for a group, with an
 *              option to create new events and view event details in a modal.
 * Input:       group (object) - group whose events are displayed
 *              isAdmin (boolean) - whether the current user can manage events
 * Output:      Rendered event list with create and detail modals
 * Return:      JSX.Element
 ******************************************************************************/
const GroupEvents = ({ group, isAdmin = true }) => {
    
    // Create event modal state
    const [ showModal, setShowModal ] = useState(false)
    const [ showEventModal, setShowEventModal ] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [ events, setEvents ] = useState([])
    const { getToken } = useAuth()

    const fetchEvents = async () => {
        try {
            const token = await getToken()
            const { data } = await api.get(`/api/event/${group._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data.success) {
                setEvents(data.events)
                console.log(data)
            } else
                toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (group?._id) {
            fetchEvents();
        }
    }, [group._id]);


    return (
        <div className="bg-white rounded-lg shadow p-4 w-1/2">
        {/* Header */}
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">Upcoming Events</h2>

                {/* Admin Add Event button */}
                {isAdmin && (
                <button
                    onClick={() => setShowModal(true)}
                    className="cursor-pointer bg-primary-500 text-white text-sm px-3 py-1 rounded hover:bg-primary-600 transition"
                >
                    Add Event
                </button>
                )}
            </div>

            {/* Meetings list */}
            <div className="flex flex-col space-y-2 max-h-[60vh] overflow-y-auto">
                {events && events.length > 0 ? (
                    events.map(event => (
                        <div
                            key={event._id}
                            onClick={() => {
                                setSelectedEvent(event)
                                setShowEventModal(true)
                            }}
                            className="flex gap-3 bg-gray-50 rounded px-3 py-2 shadow-sm hover:bg-gray-100 transition cursor-pointer"
                        >
                            {/* Flyer Image */}
                            {event.flyer_photo && (
                                <img
                                    src={event.flyer_photo}
                                    alt={event.title}
                                    className="w-14 h-14 object-cover rounded-md flex-shrink-0"
                                />
                            )}

                            {/* Event Info */}
                            <div className="flex flex-col min-w-0">
                                <span className="font-medium text-base truncate" title={event.title}>
                                    {event.title}
                                </span>

                                <span
                                    className="text-sm text-gray-500 truncate"
                                    title={new Date(event.started_at).toLocaleString()}
                                >
                                    {new Date(event.started_at).toLocaleString()}
                                </span>

                                {event.location && (
                                    <span className="text-sm text-gray-500 truncate" title={event.location}>
                                        📍 {event.location}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                <p className="text-gray-500 text-sm">No upcoming events</p>
                )}
            </div>

            {showEventModal && (
                <EventDetailsModal
                    event={selectedEvent}
                    setShowModal={setShowEventModal}
                    isAdmin={isAdmin}
                    setEvents={setEvents}
                    setSelectedEvent={setSelectedEvent}
                />
            )}

            {showModal && <CreateEventModal 
                group={group} 
                setShowModal={setShowModal}
                onCreated={(newEvent) => {
                    setEvents(prev => [newEvent, ...prev]); // add to top
                }}
                type="event"
            />}

        </div>
    )
}

export default GroupEvents
