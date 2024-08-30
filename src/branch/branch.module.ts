import { Module } from '@nestjs/common';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';
import { BranchRepository } from './branch.repository';
import { AccessControlModule } from 'src/access-control/access-control.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Branch, BranchSchema } from './branch.schema';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [UsersModule ,JwtModule, AccessControlModule, MongooseModule.forFeature([{ name: Branch.name, schema: BranchSchema }])],
    controllers: [BranchController],
    providers: [BranchService, BranchRepository],
})
export class BranchModule {}
