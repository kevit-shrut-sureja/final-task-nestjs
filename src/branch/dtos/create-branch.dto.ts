import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateBranchDTO {
    @IsString()
    @IsNotEmpty({message : 'Branch name is required.'})
    name : string;

    @IsString()
    @IsOptional()
    description ?: string

    @IsNumber()
    @IsNotEmpty({message : 'Batch year is required.'})
    batch : number;

    @IsNumber()
    @Min(0)
    @IsNotEmpty({message : "Total students intake is required."})
    totalStudentsIntake : number;
}