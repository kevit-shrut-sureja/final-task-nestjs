import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetAttendancePercentageDTO {
    @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
    @IsInt()
    @Min(0)
    @Max(100)
    percentage: number;

    @IsOptional()
    @IsString()
    branch?: string;

    @IsOptional()
    @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
    @IsInt()
    @Min(1900)
    @Max(9999)
    batch?: number;

    @IsOptional()
    @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
    @IsInt()
    @Min(1)
    @Max(8)
    semester?: number;
}
