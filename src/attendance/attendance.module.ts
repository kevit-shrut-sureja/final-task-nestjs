import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { Attendance, AttendanceSchema } from './attendance.schema';
import { AttendanceRepository } from './attendance.repository';
import { UsersModule } from '../users/users.module';
import { AccessControlModule } from '../access-control/access-control.module';

@Module({
    imports: [UsersModule, AccessControlModule, JwtModule, MongooseModule.forFeature([{ name: Attendance.name, schema: AttendanceSchema }])],
    controllers: [AttendanceController],
    providers: [AttendanceService, AttendanceRepository],
})
export class AttendanceModule {}
