/*******************************************************************************
 * File:        GroupChatBox.jsx
 * Description: Group chat page displaying the message history for a study group
 *              and supporting text and image message sending. Shows each
 *              sender's avatar and name since messages are multi-party.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import React, { useRef, useState, useEffect } from 'react'
import { ImageIcon, SendHorizonal, Users } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { fetchGroupMessages, resetGroupMessages } from '../features/groupMessages/groupMessagesSlice'
import toast from 'react-hot-toast'
import api from '../api/axios'

/*******************************************************************************
 * Function:    GroupChatBox
 * Description: Fetches and displays the full message history for a group chat
 *              (identified by URL param), listens for new messages via Redux,
 *              and submits text or image messages via the API.
 * Input:       None (reads groupId from URL params and auth from Clerk)
 * Output:      Rendered group chat view with sender info, message list, and input
 * Return:      JSX.Element
 ******************************************************************************/
const GroupChatBox = () => {
    const { groupId } = useParams()
    const { getToken, userId } = useAuth()
    const dispatch = useDispatch()
    const { messages } = useSelector((state) => state.groupMessages)
    const messagesEndRef = useRef(null)

    const [group, setGroup] = useState(null)
    const [memberMap, setMemberMap] = useState({})
    const [text, setText] = useState('')
    const [image, setImage] = useState(null)

    const fetchGroup = async () => {
        try {
            const token = await getToken()
            const { data } = await api.get(`/api/group/${groupId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                setGroup(data.group)
                const map = {}
                for (const m of data.group.members) {
                    map[m._id] = m
                }
                setMemberMap(map)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Resolve sender from a message — populated object or raw ID string
    const getSender = (msg) => {
        const id = msg.from_user_id
        if (id && typeof id === 'object') return id
        return memberMap[id] || null
    }

    const sendMessage = async () => {
        try {
            if (!text && !image) return

            const token = await getToken()
            const formData = new FormData()
            formData.append('group_id', groupId)
            formData.append('text', text)
            image && formData.append('image', image)

            const { data } = await api.post('/api/group-message/send', formData, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data.success) {
                setText('')
                setImage(null)
            } else {
                throw new Error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        fetchGroup()

        const loadMessages = async () => {
            const token = await getToken()
            dispatch(fetchGroupMessages({ token, groupId }))
        }
        loadMessages()

        return () => {
            dispatch(resetGroupMessages())
        }
    }, [groupId])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    if (!group) return null

    return (
        <div className='flex flex-col h-screen'>
            {/* Header */}
            <div className='flex items-center gap-3 p-2 md:px-10 xl:pl-42 bg-gradient-to-r from-primary-50 to-primary-50 border-b border-gray-300'>
                {group.group_picture
                    ? <img src={group.group_picture} alt="" className='size-9 rounded-full object-cover'/>
                    : <div className='size-9 rounded-full bg-primary-100 flex items-center justify-center'>
                        <Users className='size-5 text-primary-600'/>
                      </div>
                }
                <div>
                    <p className='font-medium'>{group.name}</p>
                    <p className='text-sm text-gray-500 -mt-1'>{group.members.length} members</p>
                </div>
            </div>

            {/* Messages */}
            <div className='p-5 md:px-10 h-full overflow-y-scroll'>
                <div className='space-y-4 max-w-4xl mx-auto'>
                    {messages.map((message, index) => {
                        const senderId = typeof message.from_user_id === 'object'
                            ? message.from_user_id._id
                            : message.from_user_id
                        const isOwn = senderId === userId
                        const sender = getSender(message)

                        return (
                            <div key={index} className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                                {!isOwn && sender && (
                                    <img
                                        src={sender.profile_picture}
                                        alt=""
                                        className='size-8 rounded-full flex-shrink-0 mt-1 object-cover'
                                    />
                                )}
                                <div className={`flex flex-col max-w-sm ${isOwn ? 'items-end' : 'items-start'}`}>
                                    {!isOwn && sender && (
                                        <p className='text-xs text-gray-500 mb-0.5 ml-1'>{sender.full_name}</p>
                                    )}
                                    <div className={`p-2 text-sm bg-white text-slate-700 rounded-lg shadow ${isOwn ? 'rounded-br-none' : 'rounded-bl-none'}`}>
                                        {message.message_type === 'image' && (
                                            <img src={message.media_url} className='w-full max-w-sm rounded-lg mb-1' alt="" />
                                        )}
                                        <p>{message.text}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input */}
            <div className='px-4'>
                <div className='flex items-center gap-3 pl-5 p-1.5 bg-white w-full max-w-xl mx-auto border border-gray-200 shadow rounded-full mb-5'>
                    <input
                        type="text"
                        className='flex-1 outline-none text-slate-700'
                        placeholder='Message the group...'
                        onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        onChange={e => setText(e.target.value)}
                        value={text}
                    />

                    <label htmlFor='group-image'>
                        {image
                            ? <img src={URL.createObjectURL(image)} alt="" className='h-8 rounded'/>
                            : <ImageIcon className='size-7 text-gray-400 cursor-pointer'/>
                        }
                        <input
                            type="file"
                            id='group-image'
                            accept="image/*"
                            hidden
                            onChange={e => setImage(e.target.files[0])}
                        />
                    </label>

                    <button
                        onClick={sendMessage}
                        className='bg-gradient-to-br from-primary-500 to-pruple-600 hover:from-primary-700 hover:to-primary-800 active:scale-95 cursor-pointer text-white p-2 rounded-full'
                    >
                        <SendHorizonal size={18}/>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default GroupChatBox
