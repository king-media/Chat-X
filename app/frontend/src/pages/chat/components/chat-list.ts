/* 
  Contacts Component 

  1. Get list of contacts and display them.

  2. Clicking on contact will start a new conversation or get an existing conversation
*/

import { getChats } from '~/api/chat'
import { type Chat, type ChatList } from '@whatsapp/shared'

const renderChat = (chat: Chat, chatsContainer: HTMLDivElement) => {
  const listItem = `
  <div class="chat">
  <span class="chat-name">${chat.username}</span>
  </div>
  `
  chatsContainer.insertAdjacentHTML('beforeend', listItem)
}

const renderAddChatBtn = (chatsContainer: HTMLDivElement) => {
  const addBtn = document.createElement('button')

  addBtn.innerHTML = '+'
  addBtn.addEventListener('click', () => {
    console.log('click')
  })  // Add chat functionality

  chatsContainer.insertAdjacentElement('beforeend', addBtn)
}

const ChatList = async () => {
  const chatsContainer = document.createElement('div')
  chatsContainer.setAttribute('id', 'chats-container')

  const chats = await getChats()
  chats.forEach((chat) => renderChat(chat, chatsContainer))

  renderAddChatBtn(chatsContainer)

  return chatsContainer
}

export default ChatList
