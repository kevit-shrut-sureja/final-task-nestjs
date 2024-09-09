import { forwardRef, Module } from '@nestjs/common';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';
import { BranchRepository } from './branch.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Branch, BranchSchema } from './branch.schema';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AccessControlModule } from '../access-control/access-control.module';

@Module({
    imports: [forwardRef(() => UsersModule), JwtModule, AccessControlModule, MongooseModule.forFeature([{ name: Branch.name, schema: BranchSchema }])],
    controllers: [BranchController],
    providers: [BranchService, BranchRepository],
    exports: [BranchRepository],
})
export class BranchModule {}
