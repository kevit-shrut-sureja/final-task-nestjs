import { Module } from '@nestjs/common';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';
import { BranchRepository } from './branch.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Branch, BranchSchema } from './branch.schema';
import { JwtModule } from '@nestjs/jwt';
import { AccessControlModule } from '../access-control/access-control.module';
import { User, UserSchema } from '../users/users.schema';
import { UserRepository } from '../users/users.repository';

@Module({
    imports: [
        JwtModule,
        AccessControlModule,
        MongooseModule.forFeature([
            { name: Branch.name, schema: BranchSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    controllers: [BranchController],
    providers: [BranchService, BranchRepository, UserRepository],
    exports: [BranchRepository],
})
export class BranchModule {}
