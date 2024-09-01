import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class AttendanceDTO {
    @IsString()
    @IsNotEmpty()
    studentId: Types.ObjectId;

    @IsDateString({ strict: true }, { message: 'date must be in YYYY-MM-DD format' })
    @IsNotEmpty()
    date: string;

    @IsOptional()
    @IsBoolean()
    present?: boolean = false;
}
