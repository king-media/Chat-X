import { type ChatList } from "@whatsapp/shared"
import { fetchApi } from "./helpers/fetch"

export const getChats = async (): Promise<ChatList> => {
    const chatList = await fetchApi<ChatList>()
    return chatList
}