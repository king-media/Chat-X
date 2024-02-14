import { type User, type Message, isBlank, SocketAction, isNotBlank, parseDbUserName } from "@chatx/shared";

import { fetchApi, handleError, unwrapSettled } from "~src/api/utilities";
import type { ChatPageProps } from "~src/pages/chat";

import { sendEvent } from "~src/utils/socket";
import { firstLetter } from "~src/utils/strings";

type MessageType = "user" | "recipient";
/*
 Messages Design:
 1. When a user sends a message I send the socket message event to notify all chat members (based on connectionId)
 2. When a NEW_MESSAGE event is triggered I listen and add the chatRoom and updated chatList to state if the chatRoom is not found in state.
    - I also store the new message in the DB
 3. The socket listener will live in the root chat page. That way I can trigger a rerender of both ChatList and ChatRoom components.
    - The DOM is smart enough to recognize what needs to be painted. Each rerender will re-initialize local state which will ensure fresh new messages.
    - If a user for whatever reason lost connection and had to reconnect before receiving a message, the reconnection will cause initial messages to be fetched anyway.
    And the DB will "always" have the correct list of messages.
*/

const setConnections = async (userConnectionId: string, userKeys: User[]) => {
    try {
        const users = await fetchApi<User[]>(`/users/get?usersPrimaryKeys=${JSON.stringify(userKeys)}`)

        const connections = users?.reduce<string[]>((connectionIds, user) => {
            if (isNotBlank(user.connectionId)) {
                const hasConnection = connectionIds.includes(user.connectionId)
                return hasConnection ? connectionIds : [...connectionIds, user.connectionId]
            }

            return connectionIds

        }, [userConnectionId])

        return connections
    } catch (err) {
        const error = <Error>err
        handleError(error.message)
    }
}

const ChatRoom = async ({ pageState, appState }: ChatPageProps) => {
    const currentUser = appState?.getState<User>('user')
    const chatId = pageState.selectedChat?.chat.id

    const chatRoomContainer = document.createElement('div')
    const userMessagesContainer = document.createElement('div')
    const recipientMessagesContainer = document.createElement('div')

    chatRoomContainer.id = "chat-container"

    chatRoomContainer.innerHTML = `
        <div id="chat-room">
            <h2 id="no-messages"> No messages! Go ahead and start the conversation! </h2>
            <div id="chat-footer">
                <div id="chat-fields">
                    <form name="message-form">
                    <input
                        type="text"
                        name="message"
                        id="message-field"
                        placeholder="Send Message"
                    />
                    <button type="submit" id="send-message">Send</button>
                    </form>
                </div>
            </div>
        </div>
    `
    const insertMessage = (type: MessageType, sender: User | undefined, message: string) => {

        userMessagesContainer.id = 'user-messages'
        userMessagesContainer.className = 'messages-container'
        recipientMessagesContainer.id = "recipient-messages"
        recipientMessagesContainer.className = 'messages-container'


        const html = `
                <div class="user-name">
                <p class="user-name">${parseDbUserName(sender?.username)}</p>
                </div>
                <div class="message-container">
                    <p class="user-icon">${firstLetter(String(sender?.username))}</p>
                    <p class="text-message">${message}</p>
                </div>
            </div>`

        type === "user" ?
            userMessagesContainer.insertAdjacentHTML('beforeend', html) :
            recipientMessagesContainer.insertAdjacentHTML('beforeend', html)
    }

    const renderMessages = (messages: Partial<Message>[]) => {
        messages.forEach(message => {
            let sender = currentUser
            let messageType: MessageType = 'user'

            if (message.senderId !== currentUser?.id) {
                messageType = 'recipient'
                sender = pageState.selectedChat?.recipientUsers.find(recipient => recipient.id === message.senderId)
            }

            insertMessage(messageType, sender, String(message.text))
        })

        return `${recipientMessagesContainer.outerHTML}${userMessagesContainer.outerHTML}`
    }

    const submitMessage = async e => {
        e.preventDefault()

        const socketConnection = <WebSocket>appState?.getState('socketConnection')
        const senderId = String(currentUser?.id)
        const text = String(chatRoomContainer.querySelector('input')?.value)

        const userKeys = <User[]>pageState.selectedChat?.recipientUsers.map(({ id }) => ({ id }))
        const connections = await setConnections(String(currentUser?.connectionId), userKeys)

        const message: Message = {
            chatId: String(pageState.selectedChat?.chat.id),
            createdAt: new Date().toISOString(),
            connections,
            senderId,
            text,
        }

        sendEvent({
            action: "onMessage",
            type: SocketAction.NEW_MESSAGE,
            message,
        }, socketConnection)

        const messagesHTML = renderMessages([message])
        const chatRoom = <HTMLDivElement>document.querySelector('#chat-room')

        chatRoom.innerHTML = messagesHTML
    }

    chatRoomContainer.querySelector('[name="message-form"]')?.addEventListener('submit', submitMessage)

    if (isBlank(pageState.chatList) || isBlank(chatId)) {
        return chatRoomContainer
    }

    const [messagesRespsonse] = await Promise.allSettled([fetchApi<Message[]>(`/messages/${chatId}`)])
    const messagesRequest = unwrapSettled(messagesRespsonse)

    if (messagesRequest.status === 500) {
        handleError(messagesRequest.error)
    }

    if (messagesRequest.error || isBlank(messagesRequest.data)) {
        return chatRoomContainer
    }

    const messages = messagesRequest.data?.filter(message => message.chatId === chatId)

    chatRoomContainer.innerHTML = `
            <div id="chat-room">
               ${renderMessages(<Message[]>messages)}
            </div>
            <div id="chat-footer">
                <div id="chat-fields">
                    <form name="message-form">
                    <input
                        type="text"
                        name="message"
                        id="message-field"
                        placeholder="Send Message"
                    />
                    <button type="submit" id="send-message">Send</button>
                    </form>
                </div>
            </div>
        `

    chatRoomContainer.querySelector('[name="message-form"]')?.addEventListener('submit', submitMessage)

    return chatRoomContainer
}

export default ChatRoom