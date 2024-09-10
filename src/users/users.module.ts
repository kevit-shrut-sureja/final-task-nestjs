import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users.schema';
import { UserRepository } from './users.repository';
import { JwtModule } from '@nestjs/jwt';
import { AccessControlModule } from '../access-control/access-control.module';
import { BranchRepository } from '../branch/branch.repository';
import { Branch, BranchSchema } from '../branch/branch.schema';

@Module({
    // imports: [forwardRef(() => BranchModule), JwtModule, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), AccessControlModule],
    imports: [
        JwtModule,
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Branch.name, schema: BranchSchema },
        ]),
        AccessControlModule,
    ],
    controllers: [UsersController],
    providers: [UsersService, UserRepository, BranchRepository],
    exports: [UserRepository],
})
export class UsersModule {}
