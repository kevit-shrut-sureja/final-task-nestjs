import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthedUserType } from 'src/types';
import { UserRepository } from 'src/users/users.repository';
import { UserDocument } from 'src/users/users.schema';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private userRepository: UserRepository,
        private configService: ConfigService,
    ) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        // getting the token from the request headers
        const request = context.switchToHttp().getRequest<AuthedUserType<UserDocument>>();
        const [type, token] = request.headers['authorization']?.split(' ') || [];
        if (type !== 'Bearer' || !token) {
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        }

        // verify the token
        try {
            const PUBLIC_KEY = Buffer.from(this.configService.get<string>('PUBLIC_KEY'), 'base64').toString('utf-8');
            const payload = await this.jwtService.verifyAsync(token, { publicKey: PUBLIC_KEY, algorithms: ['RS256'] });
            
            const user = await this.userRepository.findUserById(payload.id);
            if (!user) {
                throw new NotFoundException('User not found');
            }

            // if token not found in the users tokens array
            if (!user.tokens.includes(token)) {
                throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
            }

            // set the user in the request object
            request.user = user;
            request.token = token;

            return true;
        } catch (error) {
            // in case of user not found or if token is invalid or any other
            if(error instanceof HttpException){ 
                throw error;
            }           
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        }
    }
}
