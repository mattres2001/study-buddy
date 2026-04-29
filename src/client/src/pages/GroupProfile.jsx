/*******************************************************************************
 * File:        GroupProfile.jsx
 * Description: Group profile page displaying group info, member list, active
 *              sessions, and events fetched by groupId from the URL params.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import React, { useState, useEffect } from 'react'
import GroupMemberList from '../components/GroupMemberList'
import GroupEvents from '../components/GroupEvents'
import GroupSessions from '../components/GroupSessions'
import GroupJoinRequests from '../components/GroupJoinRequests'
import LiveSessionBanner from '../components/LiveSessionBanner'
import EditGroupModal from '../components/EditGroupModal'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { Pencil } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'

/*******************************************************************************
 * Function:    GroupProfile
 * Description: Fetches group data by groupId URL param and renders the group
 *              header, member list, active sessions, and events panels.
 * Input:       None (reads groupId from URL params and auth from Clerk)
 * Output:      Rendered group profile page with member and activity sections
 * Return:      JSX.Element
 ******************************************************************************/
const GroupProfile = () => {

    const { userId, getToken } = useAuth()
    const { groupId } = useParams()
    const navigate = useNavigate()
    const [ group, setGroup ] = useState(null)
    const [ sessions, setSessions ] = useState([])
    const [ showMoreSessions, setShowMoreSessions ] = useState(false)
    const [ showEditModal, setShowEditModal ] = useState(false)
    const [ showLeaveConfirm, setShowLeaveConfirm ] = useState(false)
    const isAdmin  = group?.admins?.includes(userId)
    const isMember = group?.members?.some(m => (m._id ?? m) === userId)

    const handleLeave = async () => {
        try {
            const token = await getToken()
            const { data } = await api.post(`/api/group/${groupId}/leave`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                toast.success(data.message)
                navigate('/')
            } else {
                toast.error(data.message)
                setShowLeaveConfirm(false)
            }
        } catch (err) {
            toast.error(err.message)
        }
    }

    const now = new Date()
    const fiveMinFromNow = new Date(now.getTime() + 5 * 60 * 1000)
    const liveSessions = sessions.filter(session => {
        if (!session.started_at || !session.ended_at) return false
        const start = new Date(session.started_at)
        const end = new Date(session.ended_at)
        return ((now >= start && now <= end) || (start > now && start <= fiveMinFromNow)) && end > now
    })
    const visibleSessions = liveSessions.slice(0, 2)
    const overflowSessions = liveSessions.slice(2)

    useEffect(() => {
        if (!groupId) return

        const fetchSessions = async () => {
            const token = await getToken()

            const { data } = await api.get(`/api/session/${groupId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data.success) {
                setSessions(data.sessions)
            }
        }

        fetchSessions()
    }, [groupId])

    const fetchGroup = async (groupId) => {
        const token = await getToken()
        try {
            const { data } = await api.get(`http://localhost:4000/api/group/${groupId}`, { 
                headers: { Authorization: `Bearer ${token}` }
            })
            
            if (data.success) {
                console.log(data)
                setGroup(data.group)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        fetchGroup(groupId)
    }, [groupId])

    return (
    <>
    <div className="max-w-[1200px] mx-auto">

        {/* 🔹 Cover Photo */}
        {group && (
            <div className="relative">
                <img
                    src={group.cover_photo}
                    alt="cover"
                    className="w-full h-48 object-cover rounded-lg"
                />

                {/* 🔹 Group Picture */}
                <div className="absolute -bottom-12 left-6">
                    <img
                        src={group.group_picture}
                        alt="group"
                        className="w-24 h-24 rounded-full border-4 border-white object-cover"
                    />
                </div>
            </div>
        )}

        {/* 🔹 Name + Description + Admin actions */}
        {group && (
            <div className="mt-16 px-4 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">{group.name}</h1>
                    <p className="text-gray-600 mt-2">{group.description}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0 mt-1">
                    {isAdmin && (
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition cursor-pointer"
                        >
                            <Pencil className="w-4 h-4" /> Edit Group
                        </button>
                    )}
                    {isMember && (
                        <button
                            onClick={() => setShowLeaveConfirm(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 hover:text-red-500 hover:border-red-200 transition cursor-pointer"
                        >
                            Leave Group
                        </button>
                    )}
                </div>
            </div>
        )}


        <div className='px-4 pt-4 flex flex-col gap-3'>
            {visibleSessions.map(session => (
                <LiveSessionBanner
                    key={session._id}
                    group={group}
                    isAdmin={isAdmin}
                    sessions={[session]}
                    setSessions={(updater) =>
                        setSessions(prev =>
                            typeof updater === 'function' ? updater(prev) : updater
                        )
                    }
                    showGroupInfo={false}
                />
            ))}

            {overflowSessions.length > 0 && (
                <div className='bg-red-50 border border-red-200 rounded-xl p-4'>
                    <button
                        onClick={() => setShowMoreSessions(prev => !prev)}
                        className='flex items-center gap-2 text-red-600 font-semibold text-sm w-full'
                    >
                        <span className='w-2 h-2 rounded-full bg-red-500 animate-pulse' />
                        {overflowSessions.length} more active session{overflowSessions.length !== 1 ? 's' : ''}
                        <span className='ml-auto'>{showMoreSessions ? '▲' : '▼'}</span>
                    </button>

                    {showMoreSessions && (
                        <ul className='mt-3 flex flex-col gap-2'>
                            {overflowSessions.map(session => (
                                <li key={session._id} className='flex items-center justify-between text-sm text-gray-700 bg-white rounded-lg px-4 py-2 shadow-sm'>
                                    <div className='flex flex-col'>
                                        <span className='font-medium'>{session.title || 'Untitled Session'}</span>
                                        <span className='text-xs text-gray-400'>
                                            {new Date(session.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {' – '}
                                            {new Date(session.ended_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {session.participants && ` · ${session.participants.length} joined`}
                                        </span>
                                    </div>
                                    <span className='text-xs text-red-500 font-semibold'>🔴 Live</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>

        {/* 🔹 Join Requests (admin only) */}
        {isAdmin && group && (
            <div className="px-4 mt-4">
                <GroupJoinRequests
                    group={group}
                    onMemberAdded={() => fetchGroup(groupId)}
                />
            </div>
        )}

        {/* 🔹 Main Content */}
        <div className="flex gap-4 px-4 mt-6">
            {group && <GroupMemberList group={group} className="w-1/2" />}
            {group && <GroupEvents group={group} className="w-1/2"/>}
            {group && <GroupSessions
                group={group}
                sessions={sessions}
                setSessions={setSessions}
            />}
        </div>

    </div>

    {/* Edit modal (delete lives inside it) */}
    {showEditModal && group && (
        <EditGroupModal
            group={group}
            onClose={() => setShowEditModal(false)}
            onUpdated={(updated) => setGroup(prev => ({ ...prev, ...updated }))}
            onDeleted={() => navigate('/')}
        />
    )}

    {/* Leave confirmation */}
    {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Leave group?</h2>
                <p className="text-sm text-gray-500 mb-6">
                    You'll need to request to join again to rejoin <span className="font-semibold text-gray-700">{group?.name}</span>.
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => setShowLeaveConfirm(false)}
                        className="px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleLeave}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition cursor-pointer"
                    >
                        Leave Group
                    </button>
                </div>
            </div>
        </div>
    )}

    </>
    )
}

export default GroupProfile
