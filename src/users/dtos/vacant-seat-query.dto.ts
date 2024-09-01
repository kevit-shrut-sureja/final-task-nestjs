import { IsNumberString, IsOptional, IsString } from "class-validator";

export class VacantSeatQueryDTO {
    @IsOptional()
    @IsString()
    branchName : string;

    @IsOptional()
    @IsNumberString()
    batch : string;
}