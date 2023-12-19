import { type ChatList as ChatListType, type User } from '@chatx/shared'
import Layout from '~src/layout'
import ChatList from '~src/pages/chat/components/chat-list'
import { getChats } from '~src/api/chat'
import { fetchApi, handleError, unwrapSettled } from '~src/api/utilities'


import '~src/pages/chat/assets/chat.css'
import ChatRoom from './components/chat-room'


import { type Route } from '~src/main'
import type { ComponentProps } from '~src/utils/types'
import { useState } from '~src/utils/helper'

export type ChatPageState = {
  users?: User[] | null;
  chatList?: ChatListType | null;
  selectedChat?: ChatListType[number] | null;
}

export type ChatPageProps = ComponentProps & {
  pageState: ChatPageState
}

const Chat: Route['component'] = async () => {
  const root = document.createElement('div')
  root.id = "home-container"

  const [chatListResponse, usersResponse] = await Promise.allSettled([getChats(), fetchApi<User[]>('/users')])

  const chatListData = unwrapSettled<ChatListType>(chatListResponse)
  const users = unwrapSettled<User[]>(usersResponse)

  if (chatListData.error || users.error) {
    handleError([chatListData.error, users.error])
  }

  const initialState: ChatPageState = {
    users: users.data,
    chatList: chatListData.data,
    selectedChat: chatListData.data?.slice(0, 1)[0]
  }

  const pageState = useState<ChatPageState>(initialState, async (state) => {
    const chatList = await ChatList({ pageState: state })
    const chatRoom = await ChatRoom({ pageState: state })

    root.querySelector('#home')?.replaceChildren(chatList, chatRoom)
  })

  root.innerHTML = `
    <div id="tagline-container">
      <h1>ChatX</h1>
      <h3>This is the start of something more than a conversation...</h3>
    </div>
    <h2> Chats </h2>
    <main id="home"></main>`

  const chatList = await ChatList({ pageState })
  const chatRoom = await ChatRoom({ pageState })

  root.querySelector('#home')?.append(chatList, chatRoom)

  return Layout(root, true)
}

export default Chat
