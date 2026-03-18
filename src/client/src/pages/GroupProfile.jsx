import React, { useState, useEffect } from 'react'
import GroupCard from '../components/GroupCard'
import GroupMemberList from '../components/GroupMemberList'
import GroupEvents from '../components/GroupEvents'
import { useParams } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import api from 'axios'

const GroupProfile = () => {

    const { getToken } = useAuth()
    const { groupId } = useParams()
    const [ group, setGroup ] = useState(null)

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
    <div className="flex gap-4 px-4 max-w-[1200px] mx-auto">
        {group && <GroupMemberList group={group} className="w-1/2" />}
        {group && <GroupEvents group={group} className="w-1/2" />}
    </div>
    )
}

export default GroupProfile
