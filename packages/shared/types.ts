export type Chat = {
  id: string
  userName: string
  chatRooms: string[] | null
  additionalInfo?: unknown
}

export type ChatList = Chat[]
