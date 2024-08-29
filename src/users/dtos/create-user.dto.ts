import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString, Max, min, Min, MinLength, ValidateNested } from "class-validator";
import { ROLE, RoleType } from "src/constants/role.constants";

export class CreateUserDTO {
    @IsString()
    @IsNotEmpty({message : "Name is required."})
    name : string;
    
    @IsEmail({}, {message : "Invalid email format."})
    @IsNotEmpty({message : "Email is required."})
    email : string;

    @IsString()
    @MinLength(7, {message : "Password must be at least 7 characters long."})
    @IsNotEmpty({message : "Password is required."})
    password : string;

    @IsEnum([...Object.values(ROLE)])
    @IsNotEmpty({message : "User role is required."})
    role : RoleType

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    branchId?: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    branchName?: string;

    @IsOptional()
    @IsNotEmpty()
    @IsPhoneNumber('IN', { message: 'Invalid phone number format.' })
    phone?: string;

    @IsOptional()
    @IsNotEmpty()
    @IsNumber({}, { message: 'Batch must be a number.' })
    @Max(2999)
    @Min(1900)
    batch?: number;

    @IsOptional()
    @IsNotEmpty()
    @IsNumber({}, { message: 'Current semester must be a number.' })
    @Min(1)
    @Max(8)
    currentSemester?: number;
}