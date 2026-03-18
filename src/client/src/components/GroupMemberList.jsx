import React from 'react'
import { useNavigate } from 'react-router-dom'

const GroupMemberList = ({ group }) => {

    const navigate = useNavigate()

    if (!group?.members || group.members.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-4 w-1/2">
                <h2 className="text-lg font-semibold mb-2">Group Members (0)</h2>
                <p className="text-gray-600 text-sm">No members yet</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow p-4 w-1/2">
            {/* Header */}
            <h2 className="text-lg font-semibold mb-3">
                Group Members ({group.members.length})
            </h2>

            {/* Vertical member list */}
            <div className="flex flex-col space-y-2 max-h-[80vh] overflow-y-auto">
                {group.members.map(member => (
                <div
                    key={member._id}
                    className="flex items-center space-x-3 bg-gray-50 rounded px-3 py-2 cursor-pointer hover:bg-gray-100 transition duration-150"
                    onClick={() => navigate(`/profile/${member._id}`)}
                >
                    {/* Avatar */}
                    <img
                        src={member.profile_picture || '/default-avatar.png'}
                        alt={member.username}
                        className="w-10 h-10 rounded-full border border-indigo-400 object-cover"
                    />

                    {/* Names */}
                    <div className="flex flex-col overflow-hidden">
                        <span
                            className="text-base font-medium truncate"
                            title={member.full_name}
                        >
                            {member.full_name}
                        </span>
                        <span
                            className="text-sm text-gray-500 truncate"
                            title={`@${member.username}`}
                        >
                            @{member.username}
                        </span>
                    </div>
                </div>
                ))}
            </div>
        </div>
    )
}

export default GroupMemberList
