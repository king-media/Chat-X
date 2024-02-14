import {
  InitEvent,
  NewMessageEvent,
  SocketAction,
  isBlank,
  isFalsy,
  isNotBlank,
  type ChatList as ChatListType,
  type User
} from '@chatx/shared'
import Layout from '~src/layout'
import ChatList from '~src/pages/chat/components/chat-list'

import { fetchApi } from '~src/api/utilities'


import '~src/pages/chat/assets/chat.css'
import ChatRoom from './components/chat-room'


import { navigateTo, type Route } from '~src/main'
import type { ComponentProps } from '~src/utils/types'
import { useState } from '~src/utils/helper'

import { connectToSocket, getCurrentUser, updateCurrentUser } from '~src/api/auth'
import { eventListener, sendEvent } from '~src/utils/socket'

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

  const user = appState?.getState<User>('user') || getCurrentUser()?.user

  if (isBlank(user)) {
    navigateTo("/login")
    return Layout(root, true)
  }

  const socketConnection: WebSocket = connectToSocket(String(user?.id))

  let initialState: ChatPageState,
    pageState: ChatPageState

  const initialRender = async (initEvent: InitEvent) => {
    const chatListData: ChatListType | undefined | null = initEvent.metadata?.chatList
    const connectedUser: User | undefined | null = initEvent.metadata?.user ?? user

    appState?.setState({
      user: {
        ...connectedUser,
        connectionId: initEvent.message
      }
    })

    initialState = {
      chatList: chatListData,
      selectedChat: chatListData?.slice(0, 1)[0]
    }

    pageState = useState<ChatPageState>(initialState, async (state) => {
      const chatList = await ChatList({ pageState: state, appState })
      const chatRoom = await ChatRoom({ pageState: state, appState })

      root.querySelector('#home')?.replaceChildren(chatList, chatRoom)
    })

    const chatList = await ChatList({ pageState, appState })
    const chatRoom = await ChatRoom({ pageState, appState })

    root.querySelector('#home')?.append(chatList, chatRoom)
  }

  const handleNewMessage = async (messageEvent: NewMessageEvent) => {
    const { message } = messageEvent
    const currentChatList = pageState?.chatList?.slice() || []

    const hasChat = appState?.getState<User>('user')?.chatRooms?.some(({ id }) => id === message.chatId)

    if (isFalsy(hasChat)) {
      const [newChat] = await fetchApi<ChatList>(`/rooms/${user?.id}?chats=${JSON.stringify([{ id: message.chatId }])}`)

      appState?.setState((prevState) => {
        const prevUser = <User>prevState.user

        return isNotBlank(prevUser?.chatRooms) ? ({
          ...prevState,
          user: {
            ...prevState.user,
            chatRooms: [...prevUser.chatRooms, { id: newChat.chat.id }]
          }
        }) : prevState
      })

      pageState.chatList = [...currentChatList, newChat]
      pageState.selectedChat = newChat
      return
    }

    const chatList = await ChatList({ pageState, appState })
    const chatRoom = await ChatRoom({ pageState, appState })

    root.querySelector('#home')?.replaceChildren(chatList, chatRoom)
  }

  function socketResolver(connection?: WebSocket | null) {
    const socketConnection = connection || connectToSocket(String(user?.id))

    appState?.setState({ socketConnection })

    socketConnection.onopen = async () => {
      const initEvent: InitEvent = {
        action: "onMessage",
        type: SocketAction.INIT,
        message: undefined,
        metadata: { userId: user?.id, userChatRooms: user?.chatRooms }
      }

      sendEvent(initEvent, socketConnection)
    }

    socketConnection.onmessage = eventListener(async (socketEvent) => {
      switch (socketEvent.type) {
        case SocketAction.INIT:
          await initialRender(<InitEvent>socketEvent)
          break;
        case SocketAction.NEW_MESSAGE:
          await handleNewMessage(<NewMessageEvent>socketEvent)
          break;
        default:
          break;
      }
    })

    socketConnection.onclose = async (ev) => {
      const user = appState?.getState<User>('user')

      if (ev.code === 1006 || isFalsy(ev.wasClean)) {
        socketResolver()
        return
      }

      if (isNotBlank(user)) {
        const updatedUser: User = {
          id: user.id,
          createdAt: user.createdAt,
          chatRooms: user.chatRooms,
          username: user.username,
          email: user.email
        }

        updateCurrentUser(updatedUser)
      }

      // WebSocket API Gateway Idle timeout: 10 mins
      const shouldReconnect = confirm('Server Disconnected. Confirm reconnection below.')

      if (shouldReconnect) {
        socketResolver()
      } else {
        // NOTE: close() window if user decides not to connect or remove local storage and nav to login
      }
    }
  }

  socketResolver(socketConnection)

  return Layout(root, true)
}

export default Chat
