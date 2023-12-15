import { type ChatList } from "@chatx/shared"
import { fetchApi } from "~src/api/utilities"

export const getChats = async (): Promise<ChatList> => {
    const chatList = await fetchApi<ChatList>('/chats')
    return chatList
}