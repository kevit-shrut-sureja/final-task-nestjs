import { Request } from 'express';

export interface AuthedUserType<T> extends Request {
    user: T;
    token: string;
}
