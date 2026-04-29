/*******************************************************************************
 * File:        connectionsSlice.js
 * Description: Redux slice managing the authenticated user's connections,
 *              followers, following, and pending connection request state.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

const initialState = {
    connections: [],
    pendingConnections: [],
    followers: [],
    following: []
}

/*******************************************************************************
 * Function:    fetchConnections
 * Description: Async thunk that retrieves the authenticated user's connections,
 *              followers, following, and pending requests from the API.
 * Input:       token (string) - Clerk auth token
 * Output:      Dispatches fulfilled/rejected Redux actions
 * Return:      Promise<{ connections, pendingConnections, followers, following } | null>
 ******************************************************************************/
export const fetchConnections = createAsyncThunk('connections/fetchConnections', async (token) => {
    const { data } = await api.get('/api/user/connections', {
        headers: { Authorization: `Bearer ${token}`}
    })
    return data.success ? data : null
})

const connectionsSlice = createSlice({
    name: 'connections',
    initialState,
    reducers: {
        
    },
    extraReducers: (builder) => {
        builder.addCase(fetchConnections.fulfilled, (state, action) => {
            if (action.payload) {
                state.connections = action.payload.connections
                state.pendingConnections = action.payload.pendingConnections
                state.followers = action.payload.followers
                state.following = action.payload.following
            }
        })
    }
})

export default connectionsSlice.reducer