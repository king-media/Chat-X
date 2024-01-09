import { type User } from "@chatx/shared";

export type FormBody = {
    username: string,
    password: string,
    email?: string,
}

export type CurrentUser = {
    access_token: string;
    expires_in: string;
    user?: User;
    receiveTime: number;
}
export interface FetchResponse<T> {
    data?: T | null;
    error?: string;
}

export interface SocketEvent extends MessageEvent {
    data: {
        type: string
        message: unknown
    }
}