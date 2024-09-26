import { Transform } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class GetAbsentStudentsListDTO {
    @IsDateString({ strict: true })
    date: string;

    @IsOptional()
    @IsString()
    branch?: string;

    @IsOptional()
    @Transform(({ value }) => parseInt(value, 10))
    @IsInt()
    @Min(1900)
    @Max(9999)
    batch?: number;

    @IsOptional()
    @Transform(({ value }) => parseInt(value, 10)) // Converts the string to a number
    @IsInt()
    @Min(1)
    @Max(8)
    semester?: number; // Changed to number
}
