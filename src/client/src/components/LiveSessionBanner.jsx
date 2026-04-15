import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const LiveSessionBanner = ({ sessions, setSessions, group, isAdmin, onSessionEnded }) => {

    const [isEditing, setIsEditing] = useState(false)
    const [vibeInput, setVibeInput] = useState({
        vibe: "",
        emoji: "✨"
    })
    const { getToken } = useAuth()

    const liveSession = useMemo(() => {
        const now = new Date()
        const fiveMinFromNow = new Date(now.getTime() + 5 * 60 * 1000)

        return sessions.find(session => {
            if (!session.started_at || !session.ended_at) return false

            const start = new Date(session.started_at)
            const end = new Date(session.ended_at)

            // 🔴 currently live
            const isLive = now >= start && now <= end

            // 🟡 starting within 5 minutes
            const isStartingSoon = start > now && start <= fiveMinFromNow

            return (isLive || isStartingSoon) && end > now
        })
    }, [sessions])

    if (!liveSession) return null

    return (
        <div className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl shadow-lg p-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between">

            {/* Left */}
            <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase opacity-80">
                    🔴 Live Now
                </span>

                <h1 className="text-2xl md:text-3xl font-bold">
                    {liveSession.title || "Untitled Session"}
                </h1>

                <span className="text-sm opacity-90">
                    {new Date(liveSession.started_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                    {" – "}
                    {new Date(liveSession.ended_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </span>

                {liveSession.location && (
                    <span className="text-sm opacity-90">
                        📍 {liveSession.location}
                    </span>
                )}

                {liveSession.participants && (
                    <span className="text-sm opacity-90">
                        👥 {liveSession.participants.length} participant{liveSession.participants.length !== 1 ? 's' : ''}
                    </span>
                )}

                <div
                    className="mt-2 cursor-pointer"
                    onClick={() => {
                        if (isAdmin) {
                            setIsEditing(true)
                            setVibeInput({
                                vibe: liveSession.vibe?.vibe || "",
                                emoji: liveSession.vibe?.emoji || "✨"
                            })
                        }
                    }}
                >
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                        {liveSession.vibe?.emoji || "✨"} {liveSession.vibe?.vibe}
                    </span>
                </div>

                {isEditing && (
                    <div className="mt-3 bg-white/10 p-3 rounded-lg flex flex-col gap-2">

                        <div className="flex gap-2">
                            {/* Emoji input */}
                            <input
                                type="text"
                                maxLength={2}
                                value={vibeInput.emoji}
                                onChange={(e) =>
                                    setVibeInput(prev => ({
                                        ...prev,
                                        emoji: e.target.value
                                    }))
                                }
                                className="w-12 text-center rounded px-2 py-1 text-black"
                            />

                            {/* Vibe text */}
                            <input
                                type="text"
                                placeholder="Enter vibe (e.g. focused grind)"
                                value={vibeInput.vibe}
                                onChange={(e) =>
                                    setVibeInput(prev => ({
                                        ...prev,
                                        vibe: e.target.value
                                    }))
                                }
                                className="flex-1 px-3 py-1 rounded text-black"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="text-sm px-3 py-1 rounded bg-gray-200 text-black"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={async () => {
                                    try {
                                        const token = await getToken()

                                        const { data } = await api.patch(
                                            `/api/session/${liveSession._id}/vibe`,
                                            vibeInput,
                                            {
                                                headers: {
                                                    Authorization: `Bearer ${token}`
                                                }
                                            }
                                        )

                                        if (data.success) {
                                            setSessions(prev =>
                                            prev.map(s =>
                                                s._id === liveSession._id
                                                    ? { ...s, vibe: data.session.vibe }
                                                    : s
                                            )
                                        )
                                            setIsEditing(false)
                                        }
                                    } catch (err) {
                                        toast.error(err.message)
                                    }
                                }}
                                className="text-sm px-3 py-1 rounded bg-white text-red-500"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                )}

            </div>

            {/* Right */}
            <button
                onClick={async () => {
                    try {
                        const token = await getToken()

                        if (isAdmin) {
                            // 🔴 End Session
                            const { data } = await api.post(
                                `/api/session/${liveSession._id}/end`,
                                {},
                                {
                                    headers: {
                                        Authorization: `Bearer ${token}`
                                    }
                                }
                            )

                            if (data.success) {
                                toast.success("Session ended")
                                setSessions(prev =>
                                    prev.filter(s => String(s._id) !== String(liveSession._id))
                                )
                            } else {
                                toast.error(data.message)
                            }

                        } else {
                            // 🟢 Join Session
                            const { data } = await api.post(
                                `/api/session/${liveSession._id}/join`,
                                {},
                                {
                                    headers: {
                                        Authorization: `Bearer ${token}`
                                    }
                                }
                            )

                            if (data.success) {
                                toast.success("Joined session")
                                setSessions(prev =>
                                    prev.map(s =>
                                        s._id === liveSession._id
                                            ? data.session
                                            : s
                                    )
                                )
                            } else {
                                toast.error(data.message)
                            }
                        }

                    } catch (error) {
                        toast.error(error.message)
                    }
                }}
                className={`mt-4 md:mt-0 font-semibold px-5 py-2 rounded-lg transition
                    ${isAdmin 
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-white text-red-500 hover:bg-gray-100"
                    }`}
            >
                {isAdmin ? "End Session" : "Join Session"}
            </button>
        </div>
    )
}

export default LiveSessionBanner