import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { SignInUser } from './dtos';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'src/users/users.repository';
import { OutputUserDTO } from 'src/users/dtos';
import { Serialize } from 'src/users/users.interceptor';
import { UserDocument } from 'src/users/users.schema';

@Injectable()
@Serialize(OutputUserDTO)
export class AuthService {
    constructor(
        private readonly userRepository: UserRepository,
        private jwtService: JwtService,
    ) {}

    async validateUser({ email, password }: SignInUser) {
        try {
            const user = await this.userRepository.findUserByEmail(email);
            if (!user) {
                throw new NotFoundException('User not found.');
            }

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

    async logoutUser(user: UserDocument, all: boolean, token: string) {
        try {
            if (all) {
                user.tokens = [];
            } else {
                user.tokens = user.tokens.filter((t) => t !== token);
            }
            await user.save()
            return { message : 'success'}
        } catch (error) {
            throw new HttpException('Error in token deletion.', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
