/* 
  Contacts Component 

  1. Get list of contacts and display them.

  2. Clicking on contact will start a new conversation or get an existing conversation
*/

import { type User, type ChatList } from '@chatx/shared'
import { firstLetter, removeCommas } from '~src/utils/strings'
import Modal from '~src/components/modal'
import { fetchApi } from '~src/api/utilities'

import type { ChatPageProps } from '..'

const ChatList = async ({ appState, pageState }: ChatPageProps) => {
  const chatsContainer = document.createElement('div')
  const selectedUserIds: User[] = []

  chatsContainer.id = 'chatlist-container'

  const renderChatList = (chats: ChatList | null) => {
    const chatsHTML = chats?.map(chat => {
      const chatId = chat.chat.id
      const isSelectedChat = pageState.selectedChat && pageState.selectedChat.chat.id === chatId

      const chatName = chat.recipientUsers.reduce<string>((accumulator, { username }) => {
        const name = `${accumulator}, ${username}`
        return name.replace(/^,/g, '')
      }, '')

      return `
  <div class="chat ${isSelectedChat ? 'selected' : ''}" data-chatselected="${chatId}">
    <div class="user-icon" data-chatselected="${chatId}">
      <p>${firstLetter(chatName.split(' ')).replace(/,/g, '')}</p>
    </div>
    <div class="chat-info" data-chatselected="${chatId}">
      <h4 class="chat-name" data-chatselected="${chatId}">${chatName}</h4>
      <p class="text-message" data-chatselected="${chatId}">Last text message</p>
    </div>
    <div class="message-metadata" data-chatselected="${chatId}">
      12/06/2023    
      <div class="unread" data-chatselected="${chatId}">.</div>
    </div>
  </div>
  `
    })

    chatsContainer.insertAdjacentHTML('afterbegin', removeCommas(chatsHTML?.join() || ''))
  }

  const submitUsers = async () => {
    const users = appState?.getState('users').filter(user => selectedUserIds.includes(user.id))
    const userIds = users.map(user => user.id)

    const newChatList = await fetchApi<ChatList>('/chats/add', { method: "POST", body: JSON.stringify(userIds) })

    appState?.setState((prevState: object) => ({
      ...prevState,
      chatList: newChatList
    }))

    document.querySelectorAll('.chat').forEach(chat => chat.remove())
    renderChatList(newChatList)
  }

  const createChatModal = () => {
    const modalChildren = document.createElement('div')

    const userOptions = appState?.getState('users').map((user: User) => (
      `<option value=${user.id}>${user.username}</option>`
    ))

    modalChildren.innerHTML =
      `
      <select name="users-select" multiple>
        <option value="" disabled>Add a user to the chat</option>
        ${removeCommas(userOptions.join())}
      </select>
    `;

    const usersSelect = modalChildren.querySelector('[name="users-select"]')

    usersSelect?.addEventListener('change', (e) => {
      Array.from(e.target?.options).forEach(option => option.selected && selectedUserIds.push(option.value))
    })

    return modalChildren
  }

  const renderAddChatBtn = () => {
    const addBtn = document.createElement('button')
    const dialogChildren = document.createElement('div')

    dialogChildren.innerHTML = 'test'
    addBtn.innerHTML = '+'
    addBtn.addEventListener('click', () => {
      Modal({ children: createChatModal(), title: "Create Chat", onConfirm: submitUsers })
    })

    chatsContainer.insertAdjacentElement('beforeend', addBtn)
  }

  renderChatList(appState?.getState("chatList"))
  renderAddChatBtn()

  return chatsContainer
}

export default ChatList
