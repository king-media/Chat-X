export type Chat = {
  id: string,
  users: {
    id: string;
    createdAt: string;
  }[],
  createdAt: string
}

export type ChatList = {
  chat: Chat,
  recipientUsers: User[]
}[]

export enum Status {
  OFFLINE = "OFFLINE",
  ONLINE = "ONLINE"
}

export type User = {
  id?: string;
  email?: string;
  username?: string;
  password?: string;
  createdAt: string;
  status?: Status;
  connectionId?: string;
  chatRooms?: {
    id: string;
    createdAt: string;
  }[] | null
}

export type Message = {
  chatId: string,
  senderId: string,
  connections?: string[],
  text: string,
  createdAt: string,
  updatedAt?: string
}

export type OauthTokenResponse = {
  access_token: string,
  token_type: string,
  expires_in: number
}