/*******************************************************************************
 * File:        Dashboard.jsx
 * Description: Main dashboard page aggregating the user's groups, upcoming
 *              sessions, events, and live session banners in a single view.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import React, { useState, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/clerk-react'
import api from '../api/axios'
import LiveSessionBanner from '../components/LiveSessionBanner'
import UpcomingEventBanner from '../components/UpcomingEventBanner'
import EventDetailsModal from '../components/EventDetailsModal'

/*******************************************************************************
 * Function:    Dashboard
 * Description: Fetches and displays the authenticated user's groups, upcoming
 *              events, live sessions, and upcoming sessions in a single view.
 * Input:       None (reads auth from Clerk; fetches data from the API)
 * Output:      Rendered dashboard with group, session, and event sections
 * Return:      JSX.Element
 ******************************************************************************/
const Dashboard = () => {
    
    const { user } = useUser() // or your auth
    const { getToken } = useAuth()
    const [sessions, setSessions] = useState([])
    const [groups, setGroups] = useState([])
    const [ loading, setLoading ] = useState(true)
    const [events, setEvents] = useState([])
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [showEventModal, setShowEventModal] = useState(false)

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setLoading(true)

                const token = await getToken()

                const { data } = await api.get('/api/dashboard/data', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                if (data.success) {
                    setSessions(data.sessions)
                    console.log('sessions', data.sessions)
                    setGroups(data.groups)
                    setEvents(data.events)
                    console.log('events:', data.events)
                }

            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        if (user) fetchDashboard()

    }, [user])

    const now = new Date()

    const activeSessions = sessions.filter(s => {
        const start = new Date(s.started_at)
        const end = s.ended_at ? new Date(s.ended_at) : null

        return start <= now && (!end || now <= end)
    })


    return (
        <div className="p-4 space-y-4">

            {/* 🔥 Upcoming Events */}
            {events.length === 0 ? (
                <div className="text-center text-gray-500 py-6">
                    No upcoming events
                </div>
            ) : (
                events.map(event => {
                    const group = groups.find(g => g._id === event.groupId)
                    if (!group) return null

                    const isAdmin = group.admins?.includes(user?.id)

                    return (
                        <div
                            key={event._id}
                            onClick={() => {
                                setSelectedEvent(event)
                                setShowEventModal(true)
                            }}
                            className="cursor-pointer"
                        >
                            <UpcomingEventBanner
                                event={event}
                                group={group}
                                isAdmin={isAdmin}
                                showGroupInfo={true}
                            />
                        </div>
                    )
                })
            )}


            {/* 🔴 ACTIVE SESSIONS ONLY */}
            {activeSessions.length === 0 ? (
                <div className="text-center text-gray-500 py-6">
                    No active sessions
                </div>
            ) : (
                groups.map(group => {

                    const groupSessions = activeSessions.filter(
                        s => s.groupId === group._id
                    )

                    if (groupSessions.length === 0) return null

                    const isAdmin = group.admins?.includes(user?.id)

                    return (
                        <LiveSessionBanner
                            key={group._id}
                            sessions={groupSessions}
                            setSessions={setSessions}
                            group={group}
                            isAdmin={isAdmin}
                            showGroupInfo={true}
                        />
                    )
                })
            )}

            {showEventModal && selectedEvent && (
                <EventDetailsModal
                    event={selectedEvent}
                    setEvents={setEvents}
                    setSelectedEvent={setSelectedEvent}
                    setShowModal={setShowEventModal}
                    isAdmin={
                        groups
                            .find(g => String(g._id) === String(selectedEvent.groupId))
                            ?.admins?.includes(user?.id)
                    }
                />
            )}

        </div>
    )
}

export default Dashboard
