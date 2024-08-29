import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateUserDTO } from './dtos/create-user.dto';
import { UserRepository } from './users.repository';
import { User } from './users.schema';
import { OPERATIONS, RoleType } from 'src/constants/role.constants';
import { AccessControlService } from 'src/access-control/access-control.service';

@Injectable()
export class UsersService {
    constructor(private readonly userRepository : UserRepository, private readonly accessControlService : AccessControlService){}

    async createNewUser(authedUserRole : RoleType, createUserDto : CreateUserDTO) : Promise<User>{
        // check permission's level 
        if(!this.accessControlService.checkAccessPermission(authedUserRole, OPERATIONS.CREATE, createUserDto.role)){
            throw new ForbiddenException('Forbidden from access.')
        }
        // check if all the details provided are according to the rule
        // check if the user already exists or not
        return await this.userRepository.createUser(createUserDto)
    }
}
