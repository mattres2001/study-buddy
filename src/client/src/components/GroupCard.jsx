import React from 'react'
import banner from "../assets/sample_cover.jpg"
const GroupCard = ({group}) => {
    return (
        <div className="bg-white rounded-xl shadow overflow-hidden w-80 ml-6 mt-6">
            <img src={group.cover} alt="Group card banner" className="w-full h-40 object-cover"/>

            {/*content after banner with group info*/} 

            <div className="p-4 space-y-3">
                <h2 className="text-lg font-semibold">
                    {group.name}
                </h2>

                <p className="text-sm text-gray-500">
                    {group.memberCount} members
                </p>

                <button className="w-full bg-gray-200 hover:bg-gray-300 rounded-lg py-2 font-medium">
                    View group
                </button>
            </div>
        </div>
    )

    // return (
    //     <div
    //         onClick={() => onSelect(group)}
    //         className={`bg-white rounded-xl shadow overflow-hidden w-80 ml-6 mt-6 cursor-pointer transition border-2
    //             ${isSelected ? 'border-indigo-500 scale-[1.02]' : 'border-transparent hover:border-gray-300'}
    //         `}
    //     >
    //         <img
    //             src={group.cover}
    //             alt="Group card banner"
    //             className="w-full h-40 object-cover"
    //         />

    //         <div className="p-4 space-y-3">
    //             <h2 className="text-lg font-semibold">
    //                 {group.name}
    //             </h2>

    //             <p className="text-sm text-gray-500">
    //                 {group.memberCount} members
    //             </p>

    //             <button
    //                 type="button"
    //                 className="w-full bg-gray-200 hover:bg-gray-300 rounded-lg py-2 font-medium"
    //             >
    //                 View group
    //             </button>
    //         </div>
    //     </div>
    // );
}

export default GroupCard
