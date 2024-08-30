import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dtos/create-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { User, UserDocument } from './users.schema';
import { AccessControlGuard } from 'src/access-control/access-control.guard';
import { AccessControl } from 'src/access-control/decorator/access-control.decorator';
import { OPERATIONS, RESOURCE, RoleType } from 'src/constants/role.constants';
import { AuthedUser } from './decorator/user.decorator';
import { GetUsersQueryDto } from './dtos/get-user-query.dto';
import { Serialize } from './users.interceptor';
import { OutputUserDTO } from './dtos/output-user.dto';
import { UpdateUserDTO } from './dtos/update-user.dto';

@Controller('users')
@UseGuards(AuthGuard, AccessControlGuard)
@Serialize(OutputUserDTO)
export class UsersController {
    constructor(private readonly userService: UsersService) {}

    @Post()
    @AccessControl(false)
    async createNewUser(@AuthedUser<User>() user: User, @Body() createUserDto: CreateUserDTO): Promise<User> {
        return await this.userService.createNewUser(user, createUserDto);
    }

    @Get()
    @AccessControl(false)
    async getUsers(@AuthedUser<User>('role') authedUserRole: RoleType, @Query() query: GetUsersQueryDto): Promise<User[]> {
        return await this.userService.getUsers(authedUserRole, query);
    }

    @Get('analysis/batch')
    @AccessControl(OPERATIONS.READ, RESOURCE.BATCH_ANALYSIS)
    async getBatchAnalysis(){
        return await this.userService.batchAnalysis()
    }

    @Get(':id')
    @AccessControl(false)
    async getUserById(@AuthedUser<UserDocument>() user: UserDocument, @Param('id') id: string): Promise<User> {
        return await this.userService.getUserById(user, id);
    }

    @Delete(':id')
    @AccessControl(false)
    async deleteUser(@AuthedUser<UserDocument>() user: UserDocument, @Param('id') id: string): Promise<User> {
        return await this.userService.deleteUserWithId(user, id);
    }

    @Put(':id')
    @AccessControl(false)
    async editUser(@AuthedUser<UserDocument>() user: UserDocument, @Param('id') id: string, @Body() editedUser: UpdateUserDTO): Promise<User> {
        return await this.userService.updateUser(user, id, editedUser);
    }
}
