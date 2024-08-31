import { IsOptional, IsString, IsIn, IsInt, IsPositive, IsNumberString } from 'class-validator';

export class GetUsersQueryDto {
  @IsOptional()
  @IsString()
  matchingBy?: string;

  @IsOptional()
  @IsIn(['name', 'createdAt', 'updatedAt', 'batch', 'role', 'email', 'currentSemester'])
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'batch' | 'role' | 'email' | 'currentSemester' = 'name';

  @IsOptional()
  @IsIn(['asce', 'desc'])
  order?: 'asce' | 'desc' = 'asce';

  @IsOptional()
  @IsNumberString()
  limit?: string = '10';

  @IsOptional()
  @IsNumberString()
  skip?: string = '0';
}