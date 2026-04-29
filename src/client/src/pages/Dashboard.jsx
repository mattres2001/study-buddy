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
    
    const { user } = useUser()
    const { getToken, userId } = useAuth()
    const [sessions, setSessions] = useState([])
    const [groups, setGroups] = useState([])
    const [ loading, setLoading ] = useState(true)
    const [events, setEvents] = useState([])
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [showEventModal, setShowEventModal] = useState(false)
    const [showMoreSessions, setShowMoreSessions] = useState(false)
    const [showMoreEvents, setShowMoreEvents] = useState(false)

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
    const fiveMinFromNow = new Date(now.getTime() + 5 * 60 * 1000)

    const activeSessions = sessions.filter(s => {
        if (!s.started_at || !s.ended_at) return false
        const start = new Date(s.started_at)
        const end = new Date(s.ended_at)
        return ((now >= start && now <= end) || (start > now && start <= fiveMinFromNow)) && end > now
    })

    const visibleSessions = activeSessions.slice(0, 2)
    const overflowSessions = activeSessions.slice(2)

    const visibleEvents = events.slice(0, 2)
    const overflowEvents = events.slice(2)

    return (
        <div className="p-4 space-y-4">

            {/* 🔴 Active Sessions */}
            <h2 className="text-lg font-semibold text-gray-700">Active Sessions</h2>
            {activeSessions.length === 0 ? (
                <div className="text-center text-gray-500 py-6">No active sessions</div>
            ) : (
                <div className="space-y-3">
                    {visibleSessions.map(session => {
                        const group = groups.find(g => g._id === session.groupId)
                        if (!group) return null
                        const isAdmin = group.admins?.includes(user?.id)
                        return (
                            <LiveSessionBanner
                                key={session._id}
                                sessions={[session]}
                                setSessions={(updater) =>
                                    setSessions(prev =>
                                        typeof updater === 'function' ? updater(prev) : updater
                                    )
                                }
                                group={group}
                                isAdmin={isAdmin}
                                showGroupInfo={true}
                            />
                        )
                    })}

                    {overflowSessions.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <button
                                onClick={() => setShowMoreSessions(prev => !prev)}
                                className="flex items-center gap-2 text-red-600 font-semibold text-sm w-full"
                            >
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                {overflowSessions.length} more active session{overflowSessions.length !== 1 ? 's' : ''}
                                <span className="ml-auto">{showMoreSessions ? '▲' : '▼'}</span>
                            </button>

                            {showMoreSessions && (
                                <ul className="mt-3 flex flex-col gap-2">
                                    {overflowSessions.map(session => {
                                        const group = groups.find(g => g._id === session.groupId)
                                        return (
                                            <li key={session._id} className="flex items-center justify-between text-sm text-gray-700 bg-white rounded-lg px-4 py-2 shadow-sm">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{session.title || 'Untitled Session'}</span>
                                                    <span className="text-xs text-gray-400">
                                                        {group?.name && `${group.name} · `}
                                                        {new Date(session.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        {' – '}
                                                        {new Date(session.ended_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        {session.participants && ` · ${session.participants.length} joined`}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-red-500 font-semibold">🔴 Live</span>
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* 🗓 Upcoming Events */}
            <h2 className="text-lg font-semibold text-gray-700">Upcoming Events</h2>
            {events.length === 0 ? (
                <div className="text-center text-gray-500 py-6">No upcoming events</div>
            ) : (
                <div className="space-y-3">
                    {visibleEvents.map(event => {
                        const group = groups.find(g => g._id === event.groupId)
                        if (!group) return null
                        const isAdmin = group.admins?.includes(user?.id)
                        return (
                            <div
                                key={event._id}
                                onClick={() => { setSelectedEvent(event); setShowEventModal(true) }}
                                className="cursor-pointer"
                            >
                                <UpcomingEventBanner
                                    event={event}
                                    group={group}
                                    isAdmin={isAdmin}
                                    showGroupInfo={true}
                                    hasRSVPed={event.rsvp?.includes(userId)}
                                />
                            </div>
                        )
                    })}

                    {overflowEvents.length > 0 && (
                        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                            <button
                                onClick={() => setShowMoreEvents(prev => !prev)}
                                className="flex items-center gap-2 text-primary-600 font-semibold text-sm w-full"
                            >
                                <span className="w-2 h-2 rounded-full bg-primary-400" />
                                {overflowEvents.length} more event{overflowEvents.length !== 1 ? 's' : ''}
                                <span className="ml-auto">{showMoreEvents ? '▲' : '▼'}</span>
                            </button>

                            {showMoreEvents && (
                                <ul className="mt-3 flex flex-col gap-2">
                                    {overflowEvents.map(event => {
                                        const group = groups.find(g => g._id === event.groupId)
                                        return (
                                            <li
                                                key={event._id}
                                                onClick={() => { setSelectedEvent(event); setShowEventModal(true) }}
                                                className="flex items-center justify-between text-sm text-gray-700 bg-white rounded-lg px-4 py-2 shadow-sm cursor-pointer hover:bg-primary-50 transition"
                                            >
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{event.title || 'Untitled Event'}</span>
                                                    <span className="text-xs text-gray-400">
                                                        {group?.name && `${group.name} · `}
                                                        {new Date(event.started_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                        {' '}
                                                        {new Date(event.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-primary-500 font-semibold">📅 View</span>
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
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
