import { Model } from 'mongoose';
import { User, UserDocument } from './users.schema';
import { InjectModel } from '@nestjs/mongoose';
import { HttpException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { CreateUserDTO } from './dtos/create-user.dto';

@Injectable()
export class UserRepository {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

    async createUser(userData: CreateUserDTO): Promise<User> {
        try {
            const createdUser = await this.userModel.create(userData);
            return createdUser;
        } catch (error) {
            if (error.code === 11000) {
                throw new HttpException('User already exists', 400);
            }
            throw new ServiceUnavailableException();
        }
    }

    async findUserByEmail(email: string): Promise<UserDocument> {
        try {
            const user = await this.userModel.findOne({ email });
            if (!user) {
                throw new NotFoundException('User not found.');
            }
            return user;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new ServiceUnavailableException();
        }
    }

    async findUserById(id : string) : Promise<UserDocument>{
        try {
            const user = this.userModel.findById(id);

            if(!user){
                throw new NotFoundException('User not found');
            }
            return user;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new ServiceUnavailableException();
        }
    }
}
