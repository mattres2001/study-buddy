/*******************************************************************************
 * File:        App.jsx
 * Description: Root React component that defines all client-side routes, manages
 *              the global SSE connection for real-time messages, and dispatches
 *              initial data fetches on user authentication.
 *
 * Revision History:
 * Date         Author      SCR         Description of Change
 * ----------   ---------   -------     -------------------------
 *
 ******************************************************************************/
import React, { useEffect, useRef } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Messages from './pages/Messages'
import ChatBox from './pages/ChatBox'
import Connections from './pages/Connections'
import Discover from './pages/Discover'
import Profile from './pages/Profile'
import CreatePost from './pages/CreatePost'
import Post from './pages/Post'
import { useUser, useAuth } from '@clerk/clerk-react'
import Layout from './pages/Layout'
import { Toaster } from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { fetchUser } from './features/user/userSlice'
import { fetchConnections } from './features/connections/connectionsSlice'
import { addMessage } from './features/messages/messagesSlice'
import { addGroupMessage } from './features/groupMessages/groupMessagesSlice'
import Notification from './components/Notification'
import toast from 'react-hot-toast'
import GroupProfile from './pages/GroupProfile'
import GroupChatBox from './pages/GroupChatBox'
import CreateGroup from './pages/CreateGroup'
import Dashboard from './pages/Dashboard'
import Forum from './pages/Forum'
import SubforumPage from './pages/SubforumPage'
import ForumPostPage from './pages/ForumPostPage'
import Resources from './pages/Resources'

/*******************************************************************************
 * Function:    App
 * Description: Root component. Opens an SSE stream for incoming messages, fetches
 *              user and connection data on login, and renders the route tree.
 * Input:       None (reads user state from Clerk and Redux)
 * Output:      Rendered route tree with Toaster notifications
 * Return:      JSX.Element
 ******************************************************************************/
const App = () => {
  const { user } = useUser()
  const { getToken } = useAuth()
  const { pathname } = useLocation()
  const pathnameRef = useRef(pathname)

  const dispatch = useDispatch()

  // ONLY FOR BACKEND TESTING PURPOSES
  useEffect(() => {
    if (user)
      getToken().then((token) => console.log(token))
  })
  //----------------------------------

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const token = await getToken()
        dispatch(fetchUser(token))
        dispatch(fetchConnections(token))
      }
    }
    fetchData()
  }, [user, getToken, dispatch])

  useEffect(() => {
    pathnameRef.current = pathname
  }, [pathname])

  useEffect(() => {
    if (user) {
      const eventSource = new EventSource(import.meta.env.VITE_BASEURL + '/api/message/' + user.id)

      eventSource.onmessage = (event) => {
        const message = JSON.parse(event.data)

        if (message.group_id) {
          // Group chat message
          if (pathnameRef.current === '/group/' + message.group_id + '/chat') {
            dispatch(addGroupMessage(message))
          } else if (message.from_user_id !== user.id) {
            toast('New group message', { position: 'bottom-right' })
          }
        } else {
          // Direct message — from_user_id is a raw string ID (not populated)
          const senderId    = message.from_user_id
          const recipientId = message.to_user_id
          const otherUserId = senderId === user.id ? recipientId : senderId

          if (pathnameRef.current === '/messages/' + otherUserId) {
            dispatch(addMessage(message))
          } else if (senderId !== user.id) {
            toast.custom((t) => (
              <Notification t={t} message={message}/>
            ), { position: 'bottom-right' })
          }
        }
      }
      return () => {
        eventSource.close()
      }
    }
  }, [user, dispatch])

  return (
    <>
      <Toaster />
      <Routes>
        <Route path='/' element={ !user ? <Login/> : <Layout/>}>
          <Route index element={<Dashboard/>}/>
          <Route path='messages' element={<Messages/>}/>
          <Route path='messages/:userId' element={<ChatBox/>}/>
          <Route path='connections' element={<Connections/>}/>
          <Route path='discover' element={<Discover/>}/>
          <Route path='profile' element={<Profile/>}/>
          <Route path='profile/:profileId' element={<Profile/>}/>
          <Route path='create-post' element={<CreatePost/>}/>
          <Route path='group/:groupId' element={<GroupProfile/>}/>
          <Route path='group/:groupId/chat' element={<GroupChatBox/>}/>
          {/* make sure to have this route */}
          <Route path='post/:postId' element={<Post/>}/>
          <Route path='create-group' element={<CreateGroup/>}/>
          <Route path='forum' element={<Forum/>}/>
          <Route path='forum/:subforumId' element={<SubforumPage/>}/>
          <Route path='forum/post/:postId' element={<ForumPostPage/>}/>
          <Route path='resources' element={<Resources/>}/>
        </Route>
      </Routes>
    </>
  )
}

export default App;