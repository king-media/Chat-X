import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import {
    BatchWriteCommand,
    BatchWriteCommandInput,
    DynamoDBDocumentClient,
    PutCommand,
    QueryCommand,
    type PutCommandInput,
    type QueryCommandInput,
} from "@aws-sdk/lib-dynamodb"

import type { Message } from "@chatx/shared"
import { dbConfig } from "../../utils/dynamodb-config"

import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient(dbConfig)
const ddbDocClient = DynamoDBDocumentClient.from(client)

export const addMessagesToDb = async (messages: Message[]) => {
    const items = messages.map(message => ({
        PutRequest: {
            Item: {
                id: message.id || uuidv4(),
                chatId: message.chatId,
                senderId: message.senderId,
                text: message.text,
                createdAt: message.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
        }
    }))

    const input: BatchWriteCommandInput = {
        RequestItems: {
            "chatx-messages": items
        }
    }

    const command = new BatchWriteCommand(input)
    const batchMessagesResponse = await ddbDocClient.send(command)

    return batchMessagesResponse
}

export const addMessageToDb = async (message: Message) => {
    const input: PutCommandInput = {
        Item: {
            id: uuidv4(),
            chatId: message.chatId,
            senderId: message.senderId,
            text: message.text,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        TableName: "chatx-messages"
    }

    const command = new PutCommand(input)
    const messageResponse = await ddbDocClient.send(command)

    return messageResponse
}

export const getMessagesByChatId = async (chatId: string): Promise<Message[] | null> => {
    const input: QueryCommandInput = {
        ExpressionAttributeValues: {
            ":chatId": chatId
        },
        KeyConditionExpression: "chatId = :chatId",
        TableName: "chatx-messages",
    }

    const command = new QueryCommand(input)
    const messagesResponse = await ddbDocClient.send(command)

    if (!messagesResponse.Items) {
        console.log(`DB Query failed: ${messagesResponse}`)
        return null
    }

    return messagesResponse.Items.map(attr => ({
        chatId,
        id: attr.id,
        senderId: attr.senderId,
        text: attr.text,
        createdAt: attr.createdAt,
        updatedAt: attr.updatedAt
    }))
}