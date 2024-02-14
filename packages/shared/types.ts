export enum SocketAction {
  NEW_MESSAGE = 'NEW_MESSAGE',
  INIT = 'INIT'
}

export enum Status {
  OFFLINE = "OFFLINE",
  ONLINE = "ONLINE"
}

export interface SocketEvent<T> {
  action: 'onMessage'
  type: SocketAction
  message: { connections?: string[] } | T
}

export interface InitEvent extends SocketEvent<User['connectionId']> {
  type: SocketAction.INIT,
  message: User['connectionId'],
  metadata?: {
    userId?: string,
    user?: User | null,
    userChatRooms?: { id: string }[] | null,
    chatList?: ChatList | null
  }
}
export interface NewMessageEvent extends SocketEvent<Message> {
  type: SocketAction.NEW_MESSAGE,
  message: Message
}

export type Chat = {
  id: string,
  users: {
    id: string;
    username: string;
  }[],
  createdAt: string
}

export type ChatList = {
  chat: Chat,
  recipientUsers: User[]
}[]

export type User = {
  id?: string;
  email?: string;
  username?: string;
  password?: string;
  createdAt?: string;
  status?: Status;
  connectionId?: string;
  chatRooms?: { id: string }[] | null
}

export type Message = {
  id?: string,
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