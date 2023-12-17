import { type User } from "@chatx/shared";

export type FormBody = {
    username: string,
    password: string,
    email?: string,
}

export type ErrorResponse = {
    data: null;
    error: string;
}

export type CurrentUser = {
    user: User;
    receiveTime: number;
}