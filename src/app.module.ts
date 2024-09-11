import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AccessControlModule } from './access-control/access-control.module';
import { BranchModule } from './branch/branch.module';
import { AttendanceModule } from './attendance/attendance.module';
import { UserRepository } from './users/users.repository';
import { ROLE } from './constants';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>('MONGODB_URI'),
            }),
            inject: [ConfigService],
        }),
        UsersModule,
        AuthModule,
        AccessControlModule,
        BranchModule,
        AttendanceModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
    private readonly logger = new Logger(AppModule.name);
    constructor(private readonly usersRepository: UserRepository) {
        this.createSuperUser();
    }

    private async createSuperUser() {
        const user = await this.usersRepository.findOneUser({ role: ROLE.SUPER_ADMIN });
        if (!user) {
            await this.usersRepository.createUser({
                email: 'super-admin@email.com',
                name: 'Super Admin',
                password: 'kevit@123',
                role: ROLE.SUPER_ADMIN,
            });
            this.logger.debug('Super Admin created');
        }
    }
}
