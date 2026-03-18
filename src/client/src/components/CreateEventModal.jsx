import React, { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'

const CreateEventModal = ({ group }) => {

    const { userId, getToken } = useAuth()

    const [ editForm, setEditForm ] = useState({
        title: '',
        group: group._id,
        started_by: userId,
        started_at: null,
        ended_at: null,
        location: ''
    })

    return (
        <div>
            
        </div>
    )
}

export default CreateEventModal
