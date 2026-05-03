/*******************************************************************************
 * File:        groupMessagesSlice.js
 * Description: Redux slice managing the active group chat message list, with an
 *              async thunk for initial load and synchronous actions for real-time
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
 * Function:    fetchGroupMessages
 * Description: Async thunk that loads the message history for a group from the
 *              API, with each message's sender populated.
 * Input:       token (string) - Clerk auth token
 *              groupId (string) - ID of the group
 * Output:      Dispatches fulfilled/rejected Redux actions
 * Return:      Promise<{ messages: GroupMessage[] } | null>
 ******************************************************************************/
export const fetchGroupMessages = createAsyncThunk('groupMessages/fetchGroupMessages', async ({ token, groupId }) => {
    const { data } = await api.post('/api/group-message/get', { group_id: groupId }, {
        headers: { Authorization: `Bearer ${token}` }
    })
    return data.success ? data : null
})

const groupMessagesSlice = createSlice({
    name: 'groupMessages',
    initialState,
    reducers: {
        addGroupMessage: (state, action) => {
            const exists = state.messages.some(m => m._id === action.payload._id)
            if (!exists) state.messages = [...state.messages, action.payload]
        },
        resetGroupMessages: (state) => {
            state.messages = []
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchGroupMessages.fulfilled, (state, action) => {
            if (action.payload) {
                state.messages = action.payload.messages
            }
        })
    }
})

export const { addGroupMessage, resetGroupMessages } = groupMessagesSlice.actions

export default groupMessagesSlice.reducer
