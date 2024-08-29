import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dtos/create-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from './users.schema';
import { AccessControlGuard } from 'src/access-control/access-control.guard';
import { AccessControl } from 'src/access-control/decorator/access-control.decorator';
import { RoleType } from 'src/constants/role.constants';
import { AuthedUser } from './decorator/user.decorator';

@Controller('users')
@UseGuards(AuthGuard, AccessControlGuard)
export class UsersController {
    constructor(private readonly userService : UsersService){}

    @Post()
    @AccessControl(false)
    async createNewUser(@AuthedUser('role') authedUserRole : RoleType, @Body() createUserDto : CreateUserDTO) : Promise<User>{
        return await this.userService.createNewUser(authedUserRole, createUserDto)
    }
}
