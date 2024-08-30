import { Request } from "express";
import { User, UserDocument } from "src/users/users.schema";

export interface AuthedUserType extends Request{
    user : User,
    token : string
}