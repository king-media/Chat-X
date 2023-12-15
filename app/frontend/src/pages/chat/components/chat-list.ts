/* 
  Contacts Component 

  1. Get list of contacts and display them.

  2. Clicking on contact will start a new conversation or get an existing conversation
*/

import { getChats } from '~src/api/chat'
import { type User, type ChatList } from '@chatx/shared'
import { firstLetter, removeCommas } from '~src/utils/strings'
import AppState from '~src/state'
import Modal from '~src/components/modal'
import { fetchApi, unwrapSettled } from '~src/api/utilities'

let state: AppState
const chatsContainer = document.createElement('div')
const selectedUserIds: User[] = []

const renderChat = (chat: ChatList[number]) => {
  const chatName = chat.users.reduce<string>((accumulator, { username }) => {
    const name = `${accumulator}, ${username}`
    return name.replace(/^,/g, '')
  }, '')

  const listItem = `
  <div class="chat">
    <div class="user-icon">
      ${firstLetter(chatName.split(' ')).replace(/,/g, '')}
    </div>
    <div class="chat-info">
      <h4 class="chat-name">${chatName}</h4>
      <p class="text-message">Last text message</p>
    </div>
    <div class="message-metadata">
      12/06/2023    
      <div class="unread">.</div>
    </div>

  </div>
  `
  chatsContainer.insertAdjacentHTML('afterbegin', listItem)
}
const submitUsers = async () => {
  const users = state.getState('users').filter(user => selectedUserIds.includes(user.id))
  const userIds = users.map(user => user.id)

  const newChatList = await fetchApi<ChatList>('/chats/add', { method: "POST", body: JSON.stringify(userIds) })

  state.setState((prevState: object) => ({
    ...prevState,
    chatList: newChatList
  }))

  document.querySelectorAll('.chat').forEach(chat => chat.remove())
  newChatList.forEach((chat) => renderChat(chat))
}

const createChatModal = () => {
  const modalChildren = document.createElement('div')

  const userOptions = state.getState('users').map((user: User) => (
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

const ChatList = async (appState: AppState) => {
  state = appState
  chatsContainer.setAttribute('id', 'chatlist-container')

  const [chatListResponse, usersResponse] = await Promise.allSettled([getChats(), fetchApi<User[]>('/users')])

  const chatList = unwrapSettled<ChatList>(chatListResponse).data
  const users = unwrapSettled<User[]>(usersResponse).data

  appState.setState({ chatList, users })
  chatList?.forEach((chat) => renderChat(chat))
  renderAddChatBtn()

  return chatsContainer
}

export default ChatList
