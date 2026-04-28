/*******************************************************************************
 * File:        Notification.jsx
 * Description: Toast notification component displayed when a new message
 *              arrives while the user is not in the active chat view.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import React from 'react'
import { useNavigate } from 'react-router-dom'

/*******************************************************************************
 * Function:    Notification
 * Description: Renders a toast banner showing the sender's name and message
 *              preview; clicking it navigates to that user's chat.
 * Input:       t (Toast object) - react-hot-toast instance for dismissal
 *              message (object) - incoming message with from_user_id populated
 * Output:      Rendered notification toast
 * Return:      JSX.Element
 ******************************************************************************/
const Notification = ({ t, message }) => {
    
    const navigate = useNavigate()
    
    return (
        <div className={`max-w-md w-full bg-white shadow-lg rounded-lg flex border border-gray-300 hover:scale-105 transition`}>
            <div className='flex-1 l-4'>
                <div className='flex items-start'>
                    <img src={message.from_user_id.profile_picture} alt="" className='h-10 w-10 rounded-full flex-shrink-0 mt-0.5'/>
                    <div className='ml-3 flex-1'>
                        <p className='text-sm font-medium text-gray-900'>
                            { message.from_user_id.full_name }
                        </p>
                        <p className='text-sm text-gray-500'>
                            { message.text.slice(0, 50) }
                        </p>
                    </div>
                </div>
            </div>
            <div className='flex border-l border-gray-200'>
                <button onClick={() => {
                    navigate(`/messages/${message.from_user_id._id}`)
                    toast.dismiss(t.id)
                }} className='p-4 text-indigo-600 font-semibold'>
                    Reply
                </button>
            </div>
        </div>
    )
}

export default Notification
