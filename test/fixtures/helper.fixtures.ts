import { User, UserDocument } from "../../src/users/users.schema";

export function getBearerString(user : User | UserDocument){
    if(user.tokens.length === 0)
        throw new Error('No tokens in found cant run tests')
    return `Bearer ${user.tokens[0]}`
}