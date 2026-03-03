import React from 'react'
import { assets } from '../assets/assets.js'

const GroupBarItem = ({ group }) => {
    const profile = group?.group_picture || assets.sample_profile;
    const cover = group?.cover_photo || assets.sample_cover;
    const name = group?.name || 'Study Group';

    return (
        <div className="relative w-48 rounded-lg overflow-hidden cursor-pointer border border-gray-200">
            <div className="h-30 w-full">
                <img
                    src={cover}
                    alt={name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 w-10 h-10 rounded-full overflow-hidden border-2 border-white bg-white">
                    <img
                        src={profile}
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
            <div className="px-3 py-2 text-gray-600 space-y-1 font-medium truncate">
                {name}
            </div>
        </div>
    )
}

export default GroupBarItem
