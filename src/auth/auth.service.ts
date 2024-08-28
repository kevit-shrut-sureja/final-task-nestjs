import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserRepository } from 'src/users/users.repository';
import { SignInUser } from './dtos/sign-in-user.dto';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly userRepository: UserRepository,
        private jwtService: JwtService,
    ) {}

    async validateUser({ email, password }: SignInUser) {
        try {
            const user = await this.userRepository.findUserByEmail(email);

            const isPasswordMatch = await compare(password, user.password);

            if (!isPasswordMatch) {
                throw new BadRequestException('User email and password not found.');
            }

            // generate JWT token and return the token to the user
            const payload = { id: user.id, role: user.role };
            const token = await this.jwtService.signAsync(payload);

            user.tokens = user.tokens.concat(token);
            await user.save();

            return { token };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new HttpException('Error in token generation.', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
