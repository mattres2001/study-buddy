/*******************************************************************************
 * File:        messagesSlice.js
 * Description: Redux slice managing the active chat message list, with an async
 *              thunk for initial load and synchronous actions for real-time
 *              updates via SSE.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

const initialState = {
    messages: []
}

/*******************************************************************************
 * Function:    fetchMessages
 * Description: Async thunk that loads the message history between the
 *              authenticated user and a specified user from the API.
 * Input:       token (string) - Clerk auth token
 *              userId (string) - ID of the other user in the conversation
 * Output:      Dispatches fulfilled/rejected Redux actions
 * Return:      Promise<{ messages: Message[] } | null>
 ******************************************************************************/
export const fetchMessages = createAsyncThunk('messages/fetchMessages', async ({ token, userId }) => {
    const { data } = await api.post('/api/message/get', { to_user_id: userId }, {
        headers: { Authorization: `Bearer ${token}` }
    })
    return data.success ? data : null
})

const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        setMessages: (state, action) => {
            state.messages = action.payload
        },
        addMessage: (state, action) => {
            const exists = state.messages.some(m => m._id === action.payload._id)
            if (!exists) state.messages = [...state.messages, action.payload]
        },
        resetMessages: (state) => {
            state.messages = []
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchMessages.fulfilled, (state, action) => {
            if (action.payload) {
                state.messages = action.payload.messages
            }
        })
    }
})

export const { setMessages, addMessage, resetMessages } = messagesSlice.actions

export default messagesSlice.reducer