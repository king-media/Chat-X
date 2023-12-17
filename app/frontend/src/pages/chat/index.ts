import { type ChatList as ChatListType, type User } from '@chatx/shared'
import Layout from '~src/layout'
import ChatList from '~src/pages/chat/components/chat-list'
import { getChats } from '~src/api/chat'
import { fetchApi, handleError, unwrapSettled } from '~src/api/utilities'


import '~src/pages/chat/assets/chat.css'
import ChatRoom from './components/chat-room'


import { type Route } from '~src/main'
import type { ComponentProps } from '~src/utils/types'

export type ChatPageState = {
  selectedChat?: ChatListType[number] | null
}

export type ChatPageProps = ComponentProps & {
  pageState: ChatPageState
}

const Chat: Route['component'] = async ({ appState }) => {
  const root = document.createElement('div')
  root.id = "home-container"

  // initial data need for page render

  const [chatListResponse, usersResponse] = await Promise.allSettled([getChats(), fetchApi<User[]>('/users')])

  const chatListData = unwrapSettled<ChatListType>(chatListResponse)
  const users = unwrapSettled<User[]>(usersResponse)

  if (chatListData.error || users.error) {
    handleError([chatListData.error, users.error])
  }

  let pageState = { selectedChat: chatListData.data?.slice(0)[0] }

  appState.setState({ chatList: chatListData.data, users: users.data })


  const rerender = async () => {
    // NOTE: Handle Re-render of state change.
    const chatList = await ChatList({ appState, pageState })
    const chatRoom = await ChatRoom({ appState, pageState })

    root.querySelector('#home')?.replaceChildren(chatList, chatRoom)
  }

  const chatSelectedEvent = (e: Event) => {
    const eventName = "chatselected"

    if (e.target.hasAttribute(`data-${eventName}`)) {
      const chatId = e.target.dataset[eventName]
      const selectedChat = appState?.getState('chatList').find(item => item.chat.id === chatId)
      pageState = { ...pageState, selectedChat }
      rerender()
    }
  }

  root.innerHTML = `
    <div id="tagline-container">
      <h1>ChatX</h1>
      <h3>This is the start of something more than a conversation...</h3>
    </div>
    <h2> Chats </h2>
    <main id="home"></main>`

  // NOTE: How do we re render or update when page state and/or app state changes
  // Idea would be to wrap lines 46-50 w/ a memorize func that re runs when deps change.
  const chatList = await ChatList({ appState, pageState })
  const chatRoom = await ChatRoom({ appState, pageState })

  root.querySelector('#home')?.insertAdjacentElement('afterbegin', chatList)
  root.querySelector('#home')?.insertAdjacentElement('beforeend', chatRoom)
  root.addEventListener('click', chatSelectedEvent)

  return Layout(root, true)
}

export default Chat
