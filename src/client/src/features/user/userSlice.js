/*******************************************************************************
 * File:        userSlice.js
 * Description: Redux slice managing authenticated user profile state, with
 *              async thunks for fetching and updating user data via the API.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios.js'
import toast from 'react-hot-toast'

const initialState = {
    value: null
}

/*******************************************************************************
 * Function:    fetchUser
 * Description: Async thunk that fetches the authenticated user's profile from
 *              the API using a Clerk Bearer token.
 * Input:       token (string) - Clerk auth token
 * Output:      Dispatches fulfilled/rejected Redux actions
 * Return:      Promise<User | null>
 ******************************************************************************/
export const fetchUser = createAsyncThunk('user/fetchUser', async (token) => {
    const { data } = await api.get('/api/user/data', { headers: { Authorization: `Bearer ${token}` }
    })
    
    return data.success ? data.user : null
})

// export const updateUser = createAsyncThunk('user/update', async ({ userData, token }, { rejectWithValue }) => {
//     const { data } = await api.post('/api/user/update', userData, { headers: { Authorization: `Bearer ${token}` }
//     })

//     if (data.success) {
//         toast.success(data.message)
//         return data.user
//     } else {
//         toast.error(data.message)
//         return null
//     }
// })

/*******************************************************************************
 * Function:    updateUser
 * Description: Async thunk that sends updated profile data (FormData) to the
 *              API and returns the updated user object on success.
 * Input:       userData (FormData) - profile fields and optional image files
 *              token (string) - Clerk auth token
 * Output:      Dispatches fulfilled/rejected Redux actions
 * Return:      Promise<User | rejectWithValue(string)>
 ******************************************************************************/
export const updateUser = createAsyncThunk(
    'user/update',
    async ({ userData, token }, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/api/user/update', userData, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (!data.success) {
                return rejectWithValue(data.message)
            }

            return data.user

        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message
            )
        }
    }
)

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder.addCase(fetchUser.fulfilled, (state, action) => {
            state.value = action.payload
        }).addCase(updateUser.fulfilled, (state, action) => {
            state.value = action.payload
        })
    }
})

export default userSlice.reducer