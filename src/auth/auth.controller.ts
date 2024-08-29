import { Body, Controller, HttpCode, HttpException, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInUser } from './dtos/sign-in-user.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async loginUser(@Body() credentials: SignInUser) {
        try {
            const result = await this.authService.validateUser(credentials);
            return { statusCode: HttpStatus.OK, ...result };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            // Handle unexpected errors
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
