export type FormBody = {
    username: string,
    password: string,
    email?: string,
}

export type ErrorResponse = {
    data: null;
    error: string;
}