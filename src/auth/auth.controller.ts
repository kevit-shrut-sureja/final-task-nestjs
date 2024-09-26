import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInUser } from './dtos';
import { AuthGuard } from './auth.guard';
import { UserDocument } from '../users/users.schema';
import { AuthedUser } from '../users/decorator/user.decorator';
import { AuthedUserType } from '../types';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async loginUser(@Body() credentials: SignInUser) {
        return await this.authService.validateUser(credentials);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async logoutUser(@AuthedUser<UserDocument>() user: UserDocument, @Body('all') all: boolean = false, @Req() req: AuthedUserType<UserDocument>) {
        return await this.authService.logoutUser(user, all, req.token);
    }
}
