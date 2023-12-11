export type Chat = {
  id: string
  username: string
  chatRooms: string[] | null
  additionalInfo?: unknown
}

export type ChatList = Chat[]

export type User = {
  id: string;
  email: string;
  password: string;
  creationDate: string;
  username: string;
  chatRooms: string[] | null
}