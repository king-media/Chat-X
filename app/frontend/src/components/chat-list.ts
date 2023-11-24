/* 
  Contacts Component 

  1. Get list of contacts and display them.

  2. Clicking on contact will start a new conversation or get an existing conversation
*/

import { type Chat, type ChatList } from '@whatsapp/shared/types'

const getChats = async (): Promise<ChatList> => {
  const chatListJson: string | null = sessionStorage.getItem('chatlist')

  if (chatListJson) {
    return JSON.parse(chatListJson)
  }

  const chatListResponse = await fetch('http://localhost:3000')
  const chatList: ChatList = await chatListResponse.json()

  sessionStorage.setItem('chatlist', JSON.stringify(chatList))

  return chatList
}

const renderChat = (chat: Chat, chatsContainer: HTMLDivElement) => {
  const listItem = `
  <div class="chat">
  <span class="chat-name">${chat.userName}</span>
  <span class="last-message>${chat.chatRoom?.lastMessage || ''}</span>
  </div>
  `
  chatsContainer.insertAdjacentHTML('beforeend', listItem)
}

const renderAddChatBtn = (chatsContainer: HTMLDivElement) => {
  const addBtn = document.createElement('button')

  addBtn.innerHTML = '+'
  addBtn.onclick = () => {} // Add chat functionality

  chatsContainer.insertAdjacentElement('beforeend', addBtn)
}

const ChatList = async () => {
  const chatsContainer = document.createElement('div')
  chatsContainer.setAttribute('id', 'chats-container')

  const chats = await getChats()
  chats.forEach((chat) => renderChat(chat, chatsContainer))

  renderAddChatBtn(chatsContainer)

  return chatsContainer.outerHTML
}

export default ChatList
