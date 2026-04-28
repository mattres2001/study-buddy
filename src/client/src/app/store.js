/*******************************************************************************
 * File:        store.js
 * Description: Configures and exports the Redux store, combining the user,
 *              connections, and messages reducers.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import { configureStore } from '@reduxjs/toolkit'
import userReducer from '../features/user/userSlice.js'
import connectionsReducer from '../features/connections/connectionsSlice.js'
import messagesReducer from '../features/messages/messagesSlice.js'

export const store = configureStore({
    reducer: {
        user: userReducer,
        connections: connectionsReducer,
        messages: messagesReducer
    }
})