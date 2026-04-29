/*******************************************************************************
 * File:        ActivityForm.jsx
 * Description: Reusable form component for creating or editing a scheduled
 *              activity (session or event), with group selection via GroupBarItem.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import React from 'react'
import GroupBarItem from './GroupBarItem'

/*******************************************************************************
 * Function:    ActivityForm
 * Description: Renders a controlled form for activity fields (title, dates,
 *              location, description) and a group selector.
 * Input:       editForm (object) - current form state
 *              setEditForm (function) - form state updater
 *              group (object) - currently selected group
 *              groups (array) - list of available groups
 *              type (string) - 'session' or 'event'
 * Output:      Rendered form UI
 * Return:      JSX.Element
 ******************************************************************************/
const ActivityForm = ({ editForm, setEditForm, group, groups, type }) => {
    
    return (
        <>
            {/* Group Selector (only when not inside a group) */}
            {!group && (
                <div>
                    <label className='block text-sm font-medium text-gray-700 mb-3'>
                        Select Group
                    </label>

                    <div className="flex flex-wrap gap-3">
                        {groups.map((g) => (
                            <GroupBarItem
                                key={g._id}
                                group={g}
                                isSelected={editForm.groupId === g._id}
                                onSelect={(selectedGroup) =>
                                    setEditForm({
                                        ...editForm,
                                        groupId: selectedGroup._id
                                    })
                                }
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Title */}
            <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                    {type === "event" ? "Event Title" : "What are we studying?"}
                </label>
                <input
                    type="text"
                    className='w-full p-3 border border-gray-200 rounded-lg'
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
            </div>

            {/* Description */}
            <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Description
                </label>
                <textarea
                    rows={3}
                    className='w-full p-3 border border-gray-200 rounded-lg'
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
            </div>

            {/* Location */}
            <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                    {type === "event" ? "Event Location" : "Study Spot"}
                </label>
                <input
                    type="text"
                    className='w-full p-3 border border-gray-200 rounded-lg'
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                />
            </div>

            {/* Start */}
            <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Start Time
                </label>
                <input
                    type="datetime-local"
                    className='w-full p-3 border border-gray-200 rounded-lg'
                    value={editForm.started_at}
                    onChange={(e) => setEditForm({ ...editForm, started_at: e.target.value })}
                />
            </div>
        </>
    )
}

export default ActivityForm