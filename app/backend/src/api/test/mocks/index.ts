import { Status, type ChatList, type Message, type User } from "@chatx/shared";

export const mockMessages: Message[] = [
    {
        id: "1",
        chatId: "1",
        senderId: "send1",
        connections: [],
        text: "Yo",
        createdAt: "01/10/2024",
        updatedAt: ""
    },
    {
        id: "2",
        chatId: "2",
        senderId: "send1",
        connections: [],
        text: "Yo000",
        createdAt: "01/10/2024",
        updatedAt: ""
    }
]

export const mockRooms: ChatList = [
    {
        chat: {
            id: "1",
            users: [{ id: "send1", username: "johnny" }, { id: "send2", username: "larry" }],
            createdAt: ""
        },
        recipientUsers: [{ id: "send2", createdAt: "01/10/2024", username: "larry" }]
    },
    {
        chat: {
            id: "2",
            users: [{ id: "user2", username: "larry" }, { id: "user3", username: "johnny" }],
            createdAt: ""
        },
        recipientUsers: [{ id: "user3", username: "johnny" }]
    }
]

export const mockUserPrimaries: User[] = [
    {
        id: "user1",
        createdAt: "01/10/2024"
    },
    {
        id: "user2",
        createdAt: "01/10/2024"
    }
]

export const mockUser: User = {
    id: 'user1',
    username: 'lilbill',
    email: 'email@email.com',
    password: 'darealest1',
    createdAt: '01/15/2024',
    status: Status.ONLINE,
    chatRooms: []
}

export const mockUsers: User[] = [
    mockUser,
    {
        id: 'user2',
        username: 'lil-uzi',
        email: 'emailfake@gezly.com',
        password: 'cookielfft',
        createdAt: '01/16/2024',
        status: Status.OFFLINE,
        chatRooms: []
    }
]