/* 
  Contacts Component 

  1. Get list of contacts and display them.

  2. Clicking on contact will start a new conversation or get an existing conversation
*/

import { type User, type ChatList } from '@chatx/shared'
import { firstLetter, removeCommas } from '~src/utils/strings'
import Modal from '~src/components/modal'
import { fetchApi, handleError } from '~src/api/utilities'

import type { ChatPageProps } from '..'

const ChatList = async ({ pageState }: ChatPageProps) => {
  const chatsContainer = document.createElement('div')
  const selectedUserIds: string[] = []

  chatsContainer.id = 'chatlist-container'

  const chatSelectedEvent = (e: Event) => {
    const target = <HTMLElement>e.target
    const eventName = "chatselected"

    if (target.hasAttribute(`data-${eventName}`)) {
      const chatId = target.dataset[eventName]
      const selectedChat = pageState.chatList?.find(item => item.chat.id === chatId)
      pageState.selectedChat = selectedChat
    }
  }

  const submitUsers = async () => {
    const users = pageState.users?.filter(user => selectedUserIds.includes(user.id))
    const userIds = users?.map(user => user.id)

    try {
      const newChatList = await fetchApi<ChatList>('/chats/add', { method: "POST", body: JSON.stringify(userIds) })
      pageState.chatList = newChatList
    } catch (e) {
      const error = <Error>e
      handleError(error.message)
    }
  }

  const createChatModal = () => {
    const modalChildren = document.createElement('div')

    const userOptions = pageState.users?.map((user: User) => (
      `<option value=${user.id}>${user.username}</option>`
    ))

    modalChildren.innerHTML =
      `
      <select name="users-select" multiple>
        <option value="" disabled>Add a user to the chat</option>
        ${removeCommas(userOptions?.join())}
      </select>
    `;

    const usersSelect = modalChildren.querySelector('[name="users-select"]')

    usersSelect?.addEventListener('change', (e) => {
      const target = <HTMLSelectElement>e.target
      Array.from(target?.options).forEach(option => option.selected && selectedUserIds.push(option.value))
    })

    return modalChildren
  }

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
            <p>${removeCommas(firstLetter(chatName))}</p>
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

    chatsContainer.insertAdjacentHTML('afterbegin', String(removeCommas(chatsHTML?.join())))
    chatsContainer.addEventListener('click', chatSelectedEvent)
  }

  const renderAddChatBtn = () => {
    const addBtn = document.createElement('button')

    addBtn.innerHTML = '+'
    addBtn.addEventListener('click', () => {
      Modal({ children: createChatModal(), title: "Create Chat", onConfirm: submitUsers })
    })

    chatsContainer.append(addBtn)
  }

  renderChatList(<ChatList>pageState.chatList)
  renderAddChatBtn()

  return chatsContainer
}

export default ChatList
