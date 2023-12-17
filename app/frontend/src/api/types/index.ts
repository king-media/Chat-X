import { type User } from "@chatx/shared";

export type FormBody = {
    username: string,
    password: string,
    email?: string,
}

export type CurrentUser = {
    user: User;
    receiveTime: number;
}
export interface FetchResponse<T> {
    data?: T | null;
    error?: string;
}