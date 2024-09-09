import { Transform } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class VacantSeatQueryDTO {
    @IsOptional()
    @IsString()
    branchName : string;

    @IsOptional()
    @Transform(({value}) => Number(value))
    @IsInt()
    @Max(9999)
    @Min(1900)
    batch : number;
}