export type Chat = {
  id: string,
  users: string[],
  createdAt: string
}

export type ChatList = {
  chat: Chat,
  users: User[]
}[]

export type User = {
  id: string;
  email: string;
  password: string;
  creationDate: string;
  username: string;
}