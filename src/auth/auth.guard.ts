import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'src/users/users.repository';
import { User, UserDocument } from '../users/users.schema';
import { Request } from 'express';
import { AuthedUserType } from 'src/types/user.types';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private userRepository: UserRepository,
        private configService: ConfigService,
    ) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        // getting the token from the request headers
        const request = context.switchToHttp().getRequest<AuthedUserType>();
        const [type, token] = request.headers['authorization']?.split(' ') || [];
        if (type !== 'Bearer' || !token) {
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        }

        // verify the token
        try {
            const PUBLIC_KEY = Buffer.from(this.configService.get<string>('PUBLIC_KEY'), 'base64').toString('utf-8');
            const payload = await this.jwtService.verifyAsync(token, { publicKey: PUBLIC_KEY, algorithms: ['RS256'] });
            
            const user = await this.userRepository.findUserById(payload.id);

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
