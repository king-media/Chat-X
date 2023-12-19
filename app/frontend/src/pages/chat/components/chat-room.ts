import { type User, type Message } from "@chatx/shared";
import { getCurrentUser } from "~src/api/auth";
import { fetchApi, handleError } from "~src/api/utilities";
import type { ChatPageProps } from "~src/pages/chat";
import { firstLetter } from "~src/utils/strings";

type MessageType = "user" | "recipient";

const ChatRoom = async ({ pageState }: ChatPageProps) => {
    const currentUser = getCurrentUser()
    const chatId = pageState.selectedChat?.chat.id

    const chatRoomContainer = document.createElement('div')
    const userMessagesContainer = document.createElement('div')
    const recipientMessagesContainer = document.createElement('div')

    const messages = await fetchApi<Message[]>(`/messages/${chatId}`)


    const insertMessage = (type: MessageType, user: User | undefined, message: string) => {

        userMessagesContainer.id = 'user-messages'
        userMessagesContainer.className = 'messages-container'
        recipientMessagesContainer.id = "recipient-messages"
        recipientMessagesContainer.className = 'messages-container'


        const html = `
            <div class="user-name">
            <p class="user-name">${user?.username}</p>
            </div>
            <div class="message-container">
                <p class="user-icon">${firstLetter(String(user?.username))}</p>
                <p class="text-message">${message}</p>
            </div>
        </div>`

        type === "user" ?
            userMessagesContainer.insertAdjacentHTML('beforeend', html) :
            recipientMessagesContainer.insertAdjacentHTML('beforeend', html)
    }

    const renderMessages = (messages: Message[]) => {
        messages.forEach(message => {
            let user = currentUser?.user
            let messageType: MessageType = 'user'

            if (message.senderId !== currentUser?.user.id) {
                messageType = 'recipient'
                user = pageState.selectedChat?.recipientUsers.find(recipient => recipient.id === message.senderId)
            }

            insertMessage(messageType, user, message.text)
        })

        return `${recipientMessagesContainer.outerHTML}${userMessagesContainer.outerHTML}`
    }

    chatRoomContainer.id = "chat-container"
    chatRoomContainer.innerHTML = `
        <div id="chat-room">
           ${renderMessages(messages)}
        </div>
        <div id="chat-footer">
        <div id="chat-fields">
            <form name="message-form" action="" method="post">
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

    chatRoomContainer.querySelector('[name="message-form"]')?.addEventListener('submit', async e => {
        e.preventDefault()

        const senderId = String(currentUser?.user.id)
        const text = String(chatRoomContainer.querySelector('input')?.value)

        const message: Omit<Message, 'createdAt' | 'updatedAt' | 'chatId'> = {
            senderId,
            text,
        }

        try {
            const newMessage = await fetchApi<Message>(`/messages/${chatId}`, { method: "POST", body: JSON.stringify(message) })

            const messagesHTML = renderMessages([newMessage])
            const chatRoom = <HTMLDivElement>document.querySelector('#chat-room')

            chatRoom.innerHTML = messagesHTML
        } catch (e) {
            const error = <Error>e
            handleError(error.message)
        }
    })

    return chatRoomContainer
}

export default ChatRoom