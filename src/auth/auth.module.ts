import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                privateKey: Buffer.from(configService.get<string>('PRIVATE_KEY'), 'base64').toString('utf-8'),
                signOptions: {
                    algorithm: 'RS256',
                },
            }),
        }),
        UsersModule,
    ],
    providers: [AuthService],
    controllers: [AuthController],
})
export class AuthModule {}
