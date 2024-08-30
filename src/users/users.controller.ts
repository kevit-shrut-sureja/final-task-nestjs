import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dtos/create-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from './users.schema';
import { AccessControlGuard } from 'src/access-control/access-control.guard';
import { AccessControl } from 'src/access-control/decorator/access-control.decorator';
import { RoleType } from 'src/constants/role.constants';
import { AuthedUser } from './decorator/user.decorator';
import { GetUsersQueryDto } from './dtos/get-user-query.dto';
import { Serialize } from './users.interceptor';
import { OutputUserDTO } from './dtos/output-user.dto';

@Controller('users')
@UseGuards(AuthGuard, AccessControlGuard)
@Serialize(OutputUserDTO)
export class UsersController {
    constructor(private readonly userService: UsersService) {}

    @Post()
    @AccessControl(false)
    async createNewUser(@AuthedUser() user: User, @Body() createUserDto: CreateUserDTO): Promise<User> {
        return await this.userService.createNewUser(user, createUserDto);
    }

    @Get()
    @AccessControl(false)
    async getUsers(@AuthedUser('role') authedUserRole: RoleType, @Query() query: GetUsersQueryDto) {
        return await this.userService.getUsers(authedUserRole, query);
    }
}
