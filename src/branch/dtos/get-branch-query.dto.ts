import { Transform } from 'class-transformer';
import { IsOptional, IsNotEmpty, IsIn, IsInt, Max } from 'class-validator';

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
    @Transform(({ value }) => parseInt(value, 10))
    @IsInt()
    @Max(100)
    limit?: number = 10;

    @IsOptional()
    @Transform(({ value }) => parseInt(value, 10))
    @IsInt()
    skip?: number = 0;
}
