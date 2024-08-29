import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dtos/create-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from './users.schema';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
    constructor(private readonly userService : UsersService){}

    @Post()
    async createNewUser(@Body() createUserDto : CreateUserDTO) : Promise<User>{
        return await this.userService.createNewUser(createUserDto)
    }
}
