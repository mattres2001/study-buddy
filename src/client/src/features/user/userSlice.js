import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios.js'
import toast from 'react-hot-toast'

const initialState = {
    value: null
}

export const fetchUser = createAsyncThunk('user/fetchUser', async (token) => {
    const { data } = await api.get('/api/user/data', { headers: { Authorization: `Bearer ${token}` }
    })
    
    return data.success ? data.user : null
})

export const updateUser = createAsyncThunk('user/update', async ({ userData, token }, { rejectWithValue }) => {
    const { data } = await api.post('/api/user/update', userData, { headers: { Authorization: `Bearer ${token}` }
    })

    if (data.success) {
        toast.success(data.message)
        return data.user
    } else {
        toast.error(data.message)
        return null
    }

    // try {
    //     const { data } = await api.post('api/user/update', userData, {
    //         headers: { Authorization: `Bearer ${token}` }
    //     })

    //     if (!data.success) {
    //         return rejectWithValue(data.message)
    //     }

    //     return data.user
    // } catch (error) {
    //     return rejectWithValue(error.response?.data?.message || error.message) 
    // }
})

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