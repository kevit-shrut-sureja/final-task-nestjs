import { Injectable } from '@nestjs/common';
import { CreateUserDTO } from './dtos/create-user.dto';
import { UserRepository } from './users.repository';
import { User } from './users.schema';

@Injectable()
export class UsersService {
    constructor(private readonly userRepository : UserRepository){}

    async createNewUser(createUserDto : CreateUserDTO) : Promise<User>{
        // check permission's level 
        // check if all the details provided are according to the rule
        // check if the user already exists or not
        return await this.userRepository.createUser(createUserDto)
    }
}
