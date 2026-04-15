import React, { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import CreateSessionModal from './CreateSessionModal'
import SessionDetailsModal from './SessionDetailsModal'

const GroupSessions = ({ group, sessions, setSessions, isAdmin = true }) => {

    const [showModal, setShowModal] = useState(false)
    const [selectedSession, setSelectedSession] = useState(null)
    const [showSessionModal, setShowSessionModal] = useState(false)

    return (
        <div className="bg-white rounded-lg shadow p-4 w-1/2">

            {/* Header */}
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">Upcoming Sessions</h2>

                {isAdmin && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="cursor-pointer bg-indigo-500 text-white text-sm px-3 py-1 rounded hover:bg-indigo-600 transition"
                    >
                        Add Session
                    </button>
                )}
            </div>

            {/* Sessions list */}
            <div className="flex flex-col space-y-2 max-h-[60vh] overflow-y-auto">
                {sessions && sessions.length > 0 ? (
                    sessions.map((session, index) => {
                        console.log(`Session ${index} ID:`, session._id)

                        return (
                            <div
                                key={session._id || index} // fallback to avoid crash if undefined
                                className="flex flex-col bg-gray-50 rounded px-3 py-2 shadow-sm hover:bg-gray-100 transition cursor-pointer"
                                onClick={() => {
                                    setSelectedSession(session)
                                    setShowSessionModal(true)
                                }}
                            >
                                <span className="font-medium text-base truncate" title={session.title}>
                                    {session.title}
                                </span>

                                <span
                                    className="text-sm text-gray-500 truncate"
                                    title={new Date(session.started_at).toLocaleString()}
                                >
                                    {new Date(session.started_at).toLocaleString()}
                                </span>

                                {session.duration_hours != null && (
                                    <span className="text-sm text-gray-500">
                                        ⏱ {session.duration_hours} hour{session.duration_hours !== 1 ? 's' : ''}
                                    </span>
                                )}

                                {session.location && (
                                    <span className="text-sm text-gray-500 truncate" title={session.location}>
                                        📍 {session.location}
                                    </span>
                                )}
                            </div>
                        )
                    })
                ) : (
                    <p className="text-gray-500 text-sm">No upcoming sessions</p>
                )}
            </div>

            {showSessionModal && (
                <SessionDetailsModal
                    session={selectedSession}
                    setShowModal={setShowSessionModal}
                    isAdmin={isAdmin}
                    setSessions={setSessions}
                />
            )}

            {/* Modal */}
            {showModal && (
                <CreateSessionModal
                    group={group}
                    setShowModal={setShowModal}
                    onCreated={(newSession) => {
                        setSessions(prev => [newSession, ...prev])
                    }}
                />
            )}

        </div>
    )
}

export default GroupSessions