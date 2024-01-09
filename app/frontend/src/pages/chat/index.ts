import { isBlank, type ChatList as ChatListType, type User } from '@chatx/shared'
import Layout from '~src/layout'
import ChatList from '~src/pages/chat/components/chat-list'

import { fetchApi, handleError, unwrapSettled } from '~src/api/utilities'


import '~src/pages/chat/assets/chat.css'
import ChatRoom from './components/chat-room'


import { type Route } from '~src/main'
import type { ComponentProps } from '~src/utils/types'
import { useState } from '~src/utils/helper'

import { connectToSocket, getCurrentUser } from '~src/api/auth'

export type ChatPageState = {
  users?: User[] | null;
  chatList?: ChatListType | null;
  selectedChat?: ChatListType[number] | null;
}

export type ChatPageProps = ComponentProps & {
  pageState: ChatPageState
}

const Chat: Route['component'] = async ({ appState }) => {
  const root = document.createElement('div')
  root.id = "home-container"

  root.innerHTML = `
  <div id="tagline-container">
    <h1>ChatX</h1>
    <h3>This is the start of something more than a conversation...</h3>
  </div>
  <h2> Chats </h2>
  <main id="home"></main>`

  let socketConnection: WebSocket = appState?.getState('socketConnection')
  const currentUser = getCurrentUser()

  if (isBlank(socketConnection)) {
    socketConnection = connectToSocket(<User>currentUser?.user)
    appState?.setState({ socketConnection })
  }

  let user: User = appState?.getState('user'),
    initialState: ChatPageState,
    pageState: ChatPageState

  socketConnection.onopen = async () => {
    if (isBlank(user)) {
      user = await fetchApi<User>(`/users/get/${currentUser?.user?.username}?status=online`)
      appState?.setState({ user })
    }

    const [chatListResponse, usersResponse] = await Promise.allSettled([
      fetchApi<ChatList>(`/rooms/${user.id}?chats=${user.chatRooms}`),
      fetchApi<User[]>(`/users/online?userId=${user.id}`)
    ])

    const chatListData = unwrapSettled<ChatListType>(chatListResponse)
    const users = unwrapSettled<User[]>(usersResponse)

    if (chatListData?.error || users?.error) {
      // NOTE: Create a custom component that renders if there are no chats for user
      handleError([chatListData.error, users.error])
    }

    initialState = {
      users: users?.data,
      chatList: chatListData?.data,
      selectedChat: chatListData?.data?.slice(0, 1)[0]
    }

    pageState = useState<ChatPageState>(initialState, async (state) => {
      const chatList = await ChatList({ pageState: state })
      const chatRoom = await ChatRoom({ pageState: state })

      root.querySelector('#home')?.replaceChildren(chatList, chatRoom)
    })

    const chatList = await ChatList({ pageState })
    const chatRoom = await ChatRoom({ pageState })

    root.querySelector('#home')?.append(chatList, chatRoom)
  }

  return Layout(root, true)
}

export default Chat
