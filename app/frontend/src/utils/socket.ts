import { type SocketEvent } from "@chatx/shared"

export const sendEvent = <T>(event: SocketEvent<T>, socketConnection: WebSocket) => {
    const ev = JSON.stringify(event)
    return socketConnection.send(ev)
}

export const eventListener = (actionCb: <T>(ev: SocketEvent<T>) => Promise<void>) => <T>(ev: MessageEvent<string>) => {
    const socketEvent: SocketEvent<T> = JSON.parse(ev.data)
    actionCb(socketEvent)
}