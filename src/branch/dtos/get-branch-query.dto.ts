import { IsOptional, IsNotEmpty, IsIn, IsNumberString, IsNumber } from 'class-validator';

export class GetBranchQueryDTO {
    @IsOptional()
    @IsNotEmpty({ message: 'matchBy should not be empty if provided' })
    matchBy?: string;

    @IsOptional()
    @IsIn(['name', 'createdAt', 'updatedAt', 'batch'], {
        message: 'sortBy must be one of the following values: name, createdAt, updatedAt, batch',
    })
    sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'batch' = 'name';

    @IsOptional()
    @IsIn(['asce', 'desc'], {
        message: 'order must be either "asce" or "desc"',
    })
    order?: 'asce' | 'desc' = 'asce';

    @IsOptional()
    @IsNumberString({}, {message : "Limit must be a numeric string."})
    limit?: string = '10';

    @IsOptional()
    @IsNumberString({}, {message : "Skip must be a numeric string."})
    skip?: string = '0';
}
