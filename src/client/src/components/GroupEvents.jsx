import React, { useState, useEffect } from 'react'
import CreateEventModal from './CreateEventModal'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import api from '../api/axios'

const GroupEvents = ({ group, isAdmin = true }) => {
    
    // Create event modal state
    const [ showModal, setShowModal ] = useState(false)
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
    }, [group]);


    return (
        <div className="bg-white rounded-lg shadow p-4 w-1/2">
        {/* Header */}
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">Upcoming Events</h2>

                {/* Admin Add Event button */}
                {isAdmin && (
                <button
                    onClick={() => setShowModal(true)}
                    className="cursor-pointer bg-indigo-500 text-white text-sm px-3 py-1 rounded hover:bg-indigo-600 transition"
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

            {showModal && <CreateEventModal 
                group={group} 
                setShowModal={setShowModal}
                onEventCreated={(newEvent) => {
                    setEvents(prev => [newEvent, ...prev]); // add to top
                }
            }/>}

        </div>
    )
}

export default GroupEvents
