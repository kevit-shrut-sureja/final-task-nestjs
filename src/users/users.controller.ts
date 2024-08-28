import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dtos/create-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly userService : UsersService){}

    @Post()
    async createNewUser(@Body() createUserDto : CreateUserDTO){
        return this.userService.createNewUser(createUserDto)
    }
}
