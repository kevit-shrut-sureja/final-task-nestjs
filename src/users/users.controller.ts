import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { User, UserDocument } from './users.schema';
import { AccessControlGuard } from '../access-control/access-control.guard';
import { AccessControl } from '../access-control/decorator';
import { OPERATIONS, RESOURCE, RoleType } from '../constants';
import { AuthedUser } from './decorator/user.decorator';
import { Serialize } from './users.interceptor';
import { CreateUserDTO, GetUsersQueryDTO, OutputUserDTO, UpdateUserDTO, VacantSeatQueryDTO } from './dtos';

@Controller('users')
@UseGuards(AuthGuard, AccessControlGuard)
export class UsersController {
    constructor(private readonly userService: UsersService) {}

    @Post()
    @AccessControl(false)
    @Serialize(OutputUserDTO)
    async createNewUser(@AuthedUser<User>() user: User, @Body() createUserDto: CreateUserDTO): Promise<User> {
        return await this.userService.createNewUser(user, createUserDto);
    }

    @Get()
    @AccessControl(false)
    @Serialize(OutputUserDTO)
    async getUsers(@AuthedUser<User>('role') authedUserRole: RoleType, @Query() query: GetUsersQueryDTO): Promise<User[]> {
        return await this.userService.getUsers(authedUserRole, query);
    }

    @Get('analysis/batch')
    @AccessControl(OPERATIONS.READ, RESOURCE.BATCH_ANALYSIS)
    async getBatchAnalysis(): Promise<any[]> {
        return await this.userService.batchAnalysis();
    }

    @Get('analysis/vacantSeats')
    @AccessControl(OPERATIONS.READ, RESOURCE.BATCH_ANALYSIS)
    async getVacantAnalysis(@Query() query: VacantSeatQueryDTO) : Promise<any[]> {
        return await this.userService.vacantAnalysis(query);
    }

    @Get(':id')
    @AccessControl(false)
    @Serialize(OutputUserDTO)
    async getUserById(@AuthedUser<UserDocument>() user: UserDocument, @Param('id') id: string): Promise<User> {
        return await this.userService.getUserById(user, id);
    }

    @Delete(':id')
    @AccessControl(false)
    @Serialize(OutputUserDTO)
    async deleteUser(@AuthedUser<UserDocument>() user: UserDocument, @Param('id') id: string): Promise<User> {
        return await this.userService.deleteUserWithId(user, id);
    }

    @Put(':id')
    @AccessControl(false)
    @Serialize(OutputUserDTO)
    async editUser(@AuthedUser<UserDocument>() user: UserDocument, @Param('id') id: string, @Body() editedUser: UpdateUserDTO): Promise<User> {
        return await this.userService.updateUser(user, id, editedUser);
    }
}
