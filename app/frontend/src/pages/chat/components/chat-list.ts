/* 
  Contacts Component 

  1. Get list of contacts and display them.

  2. Clicking on contact will start a new conversation or get an existing conversation

  Flow:
  - On initial load I render a the chatList based on the current page state. If there are no chats then I return an empty state.
  If pagestate changes I trigger a re-render at page level (chat/index.ts). This will reinitialize data and update the DOM.

  - When a user selects a chat I utilize a data attribute on a target element. The data attribute is built with this model:
  * data-[eventname]=[data] -> This allows me to pass the correct data no matter where in the target element the user clicks.
  In the event listener, I update the pagestate with the new selected chat which triggers a page update.

  The idea is to mimic how React & Vue (primarily Vue) updates when a computed value changes (state, props, etc...) the component updates, diffs then prints to the DOM.
  Often times these changes could trigger a reevaluation so the page will always have correct data coming from an API. Reevalution is more so a React router thing.
  Because I am not causing a location state change reevalution is "really" not happening. In any case, throughout the pages hierarchy if dependencies change the page will refresh/update.

  - When a user attempts to create a chat. A modal will surface and allow the user to select from a list of online users. Upon confirm, the user's
  pagestate and app state will update thus causing a re-render. At this point, the new chat should appear.
*/

import { type User, type ChatList, isBlank, parseDbUserName, isNotBlank } from '@chatx/shared'
import { firstLetter, removeCommas } from '~src/utils/strings'
import Modal from '~src/components/modal'
import { fetchApi, handleError, unwrapSettled } from '~src/api/utilities'

import type { ChatPageProps } from '..'

const ChatList = async ({ pageState, appState }: ChatPageProps) => {
  const chatsContainer = document.createElement('div')
  const selectedUserIds: string[] = []
  const currentUser = appState?.getState<User>('user')

  let onlineUsers: User[] | null | undefined = []

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
    const users = onlineUsers?.filter(user => selectedUserIds.includes(String(user.id)))
      .map(({ id, createdAt, username, chatRooms }) => ({ id, createdAt, username, chatRooms }))

    if (isBlank(users)) return

    const userData = [...<User[]>users, currentUser]

    try {
      const currentChatList = pageState?.chatList?.slice() || []
      const newChat =
        await fetchApi<ChatList[number]>(`/rooms/${currentUser?.id}`, {
          method: "POST", body: JSON.stringify(userData)
        })

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
    } catch (e) {
      const error = <Error>e
      handleError(error.message)
    }
  }

  const createChatModal = async () => {
    const modalChildren = document.createElement('div')
    const [usersResponse] = await Promise.allSettled([fetchApi<User[]>(`/users/online?userId=${currentUser?.id}`)])
    const { data: users, ...usersRequest } = unwrapSettled<User[]>(usersResponse)

    if (usersRequest.status === 500) {
      handleError(usersRequest.error)
    }

    if (usersRequest.error) {
      modalChildren.innerHTML = `
      <div>
        <h2>There are no online users! Invite some friends to chat!</h2>
      </div>
      `
      return modalChildren
    }

    onlineUsers = users

    const userOptions = users?.map((user: User) => (
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

  const renderChatList = (chats?: ChatList | null) => {
    const emptyState = `
      <div class="chat">
        <h3 id="no-chats"> Let's start a conversation. Click the add '+' button below!</h3>
      </div>
    `

    const chatsHTML = chats?.map(chat => {
      const chatId = chat.chat.id
      const isSelectedChat = pageState.selectedChat && pageState.selectedChat.chat.id === chatId

      const chatName = chat.recipientUsers.reduce<string>((accumulator, { username }) => {
        const name = `${accumulator}, ${parseDbUserName(username)}`
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

    isBlank(chatsHTML) ?
      chatsContainer.insertAdjacentHTML('afterbegin', emptyState) :
      chatsContainer.insertAdjacentHTML('afterbegin', String(removeCommas(chatsHTML?.join())))

    chatsContainer.addEventListener('click', chatSelectedEvent)
  }

  const renderAddChatBtn = () => {
    const addBtn = document.createElement('button')

    addBtn.innerHTML = '+'
    addBtn.addEventListener('click', async () => {
      Modal({ children: await createChatModal(), title: "Create Chat", onConfirm: submitUsers })
    })

    chatsContainer.append(addBtn)
  }

  renderChatList(pageState.chatList)
  renderAddChatBtn()

  return chatsContainer
}

export default ChatList
