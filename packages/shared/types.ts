export type ChatRoom = {
  id: string
  lastMessage: string
}

export type Chat = {
  id: string
  userName: string
  chatRoom: ChatRoom | null
  additionalInfo?: unknown
}

export type ChatList = Chat[]
