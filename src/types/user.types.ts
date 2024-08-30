import { Request } from "express";
import { User, UserDocument } from "src/users/users.schema";

export interface AuthedUserType<T> extends Request{
    user : T,
    token : string
}