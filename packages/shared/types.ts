export type Chat = {
  id: string,
  users: string[],
  createdAt: string
}

export type ChatList = {
  chat: Chat,
  recipientUsers: User[]
}[]

export type User = {
  id: string;
  email: string;
  password: string;
  creationDate: string;
  username: string;
}

export type Message = {
  chatId: string,
  senderId: string,
  text: string,
  createdAt: string,
  updatedAt: string
}