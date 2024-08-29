import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users.schema';
import { UserRepository } from './users.repository';
import { JwtModule } from '@nestjs/jwt';
import { AccessControlModule } from 'src/access-control/access-control.module';

@Module({
  imports : [JwtModule, MongooseModule.forFeature([{name : User.name, schema : UserSchema}]), AccessControlModule],
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  exports:[UserRepository]
})
export class UsersModule {}
