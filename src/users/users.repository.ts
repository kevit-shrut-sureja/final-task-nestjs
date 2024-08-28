import { Model } from "mongoose";
import { User, UserDocument } from "./users.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { CreateUserDTO } from "./dtos/create-user.dto";

@Injectable()
export class UserRepository{
    constructor(@InjectModel(User.name) private userModel : Model<UserDocument>){}

    async createUser(userData : CreateUserDTO) : Promise<User>{
        try {
            const createdUser = await this.userModel.create(userData)
            return createdUser
        } catch (error) {
            throw new ServiceUnavailableException()
        }
    }
}