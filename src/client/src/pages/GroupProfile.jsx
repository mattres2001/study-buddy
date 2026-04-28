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
import LiveSessionBanner from '../components/LiveSessionBanner'
import { useParams } from 'react-router-dom'
import { useUser, useAuth } from '@clerk/clerk-react'
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
    const [ group, setGroup ] = useState(null)
    const [ sessions, setSessions ] = useState([])
    const isAdmin = group?.admins?.includes(userId)

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

        {/* 🔹 Name + Description */}
        {group && (
            <div className="mt-16 px-4">
                <h1 className="text-2xl font-bold">{group.name}</h1>
                <p className="text-gray-600 mt-2">{group.description}</p>
            </div>
        )}


        <div className='px-4 pt-4'>
            <LiveSessionBanner 
                group={group}
                isAdmin={isAdmin}
                sessions={sessions}
                setSessions={setSessions}
                showGroupInfo={true}
            />
        </div>

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
    )    
}

export default GroupProfile
