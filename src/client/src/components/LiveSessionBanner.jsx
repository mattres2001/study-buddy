/*******************************************************************************
 * File:        LiveSessionBanner.jsx
 * Description: Banner component that displays an active (live) study session
 *              and provides join/end controls for participants and admins.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import AvatarStack from './AvatarStack'

/*******************************************************************************
 * Function:    LiveSessionBanner
 * Description: Displays a banner for currently active sessions, allowing
 *              users to join or admins to end each live session.
 * Input:       sessions (array) - list of session objects
 *              setSessions (function) - updates sessions in the parent
 *              group (object) - group the sessions belong to
 *              isAdmin (boolean) - whether the current user can end sessions
 *              showGroupInfo (boolean) - whether to display the group name
 * Output:      Rendered live session banner(s)
 * Return:      JSX.Element
 ******************************************************************************/
const LiveSessionBanner = ({ sessions, setSessions, group, isAdmin, showGroupInfo }) => {

    const [isEditingDescription, setIsEditingDescription] = useState(false)
    const [descriptionInput, setDescriptionInput] = useState("")
    const [isEditing, setIsEditing] = useState(false)
    const [vibeInput, setVibeInput] = useState({
        text: "",
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

    const startEditDescription = () => {
        setIsEditingDescription(true)
        setDescriptionInput(liveSession.description || "")
    }

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


                {showGroupInfo && group && (
                    <div className="mt-1 flex items-center gap-2 text-sm opacity-90">

                        {/* Group name */}
                        <span className="font-medium">
                            📘 {group.name}
                        </span>

                        {/* Optional: members count */}
                        {group.members && (
                            <span className="opacity-80">
                                • {group.members.length} member{group.members.length !== 1 ? "s" : ""}
                            </span>
                        )}

                        {/* Optional: location */}
                        {group.location && showGroupInfo === "dashboard" && (
                            <span className="opacity-80">
                                • 📍 {group.location}
                            </span>
                        )}
                    </div>
                )}

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

                {liveSession.participants?.length > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                        <AvatarStack userIds={liveSession.participants} max={5} size="sm" />
                        <span className="text-sm opacity-90">
                            {liveSession.participants.length} participant{liveSession.participants.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                )}

                <div
                    className="mt-2 cursor-pointer"
                    onClick={() => {
                        if (isAdmin) {
                            setIsEditing(true)
                            setVibeInput({
                                text: liveSession.vibe?.text || "",
                                emoji: liveSession.vibe?.emoji || "✨"
                            })
                        }
                    }}
                >
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                        {liveSession.vibe?.emoji || "✨"} {liveSession.vibe?.text}
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
                                value={vibeInput.text}
                                onChange={(e) =>
                                    setVibeInput(prev => ({
                                        ...prev,
                                        text: e.target.value
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

            {/* Middle Chat Bubble */}
            {liveSession.description && (
                <div className="hidden md:flex flex-1 justify-center px-6" onClick={() => {
                                if (isAdmin) {
                                    startEditDescription()
                                    setIsEditingDescription(true)
                                }
                            }}>

                    {isEditingDescription ? (
                        <div
                            className="relative w-full max-w-2xl bg-white/20 backdrop-blur-md text-white px-6 py-5 rounded-3xl shadow-lg cursor-pointer"
                            
                        >

                            <textarea
                                value={descriptionInput}
                                onChange={(e) => setDescriptionInput(e.target.value)}
                                className="w-full min-h-[100px] bg-white/20 text-white p-3 rounded-lg outline-none resize-none"
                                placeholder="Write session description..."
                            />

                            {/* Buttons */}
                            <div className="flex gap-2 justify-end mt-3">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setIsEditingDescription(false)
                                        setDescriptionInput("")
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={async () => {
                                        try {
                                            const token = await getToken()

                                            const { data } = await api.patch(
                                                `/api/session/${liveSession._id}/description`,
                                                { description: descriptionInput },
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
                                                            ? { ...s, description: data.session.description }
                                                            : s
                                                    )
                                                )

                                                setIsEditingDescription(false)
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
                    ) : (
                        <div className="relative w-full max-w-2xl bg-white/20 backdrop-blur-md text-white px-6 py-5 rounded-3xl shadow-lg">

                            {/* Tail */}
                            <div className="absolute -left-2 top-6 w-4 h-4 bg-white/20 rotate-45" />

                            <p className="text-base leading-relaxed text-center whitespace-pre-wrap">
                                {liveSession.description}
                            </p>
                        </div>
                    )}

                </div>
            )}

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
                {isAdmin ? "End Session" : "Join Session / I'm coming"}
            </button>
        </div>
    )
}

export default LiveSessionBanner