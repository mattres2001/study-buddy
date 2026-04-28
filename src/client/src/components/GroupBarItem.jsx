/*******************************************************************************
 * File:        GroupBarItem.jsx
 * Description: Individual group item component rendered inside GroupBar,
 *              displaying the group picture and name with selection state.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import React from 'react'
import { assets } from '../assets/assets.js'
import { useNavigate } from 'react-router-dom'

/*******************************************************************************
 * Function:    GroupBarItem
 * Description: Renders a single clickable group entry with avatar and name.
 *              Navigates to the group profile or calls onSelect when clicked.
 * Input:       group (object) - group data (name, group_picture)
 *              onSelect (function) - callback when the item is selected
 *              isSelected (boolean) - highlights the item if currently active
 * Output:      Rendered group list item
 * Return:      JSX.Element
 ******************************************************************************/
const GroupBarItem = ({ group, onSelect, isSelected  }) => {
    const profile = group?.group_picture || assets.sample_profile;
    const cover = group?.cover_photo || assets.sample_cover;
    const name = group?.name || 'Study Group';
    const navigate = useNavigate()

    const handleClick = () => {
        if (onSelect) {
            onSelect(group); // 👈 selection mode
        } else {
            navigate(`/group/${group._id}`); // 👈 default behavior
        }
    };

    return (
        <div 
            onClick={handleClick}
            className={`relative w-48 rounded-lg overflow-hidden cursor-pointer border transition
                ${isSelected 
                    ? 'border-indigo-500 ring-2 ring-indigo-300' 
                    : 'border-gray-200 hover:border-gray-300'}
            `}
        >
            <div className="h-30 w-full">
                <img
                    src={cover}
                    alt={name}
                    className="w-full h-full object-cover"
                />

                {/* Profile */}
                <div className="absolute top-2 left-2 w-10 h-10 rounded-full overflow-hidden border-2 border-white bg-white">
                    <img
                        src={profile}
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Selected Badge */}
                {isSelected && (
                    <div className="absolute top-2 right-2 bg-indigo-500 text-white text-xs px-2 py-1 rounded">
                        Selected
                    </div>
                )}
            </div>

            <div className="px-3 py-2 text-gray-600 font-medium truncate">
                {name}
            </div>
        </div>
    );

    // return (
    //     <div 
    //         className="relative w-48 rounded-lg overflow-hidden cursor-pointer border border-gray-200" 
    //         onClick={() => navigate(`/group/${group._id}`)
    //     }>
    //         <div className="h-30 w-full">
    //             <img
    //                 src={cover}
    //                 alt={name}
    //                 className="w-full h-full object-cover"
    //             />
    //             <div className="absolute top-2 left-2 w-10 h-10 rounded-full overflow-hidden border-2 border-white bg-white">
    //                 <img
    //                     src={profile}
    //                     alt={name}
    //                     className="w-full h-full object-cover"
    //                 />
    //             </div>
    //         </div>
    //         <div className="px-3 py-2 text-gray-600 space-y-1 font-medium truncate">
    //             {name}
    //         </div>
    //     </div>
    // )
}

export default GroupBarItem
