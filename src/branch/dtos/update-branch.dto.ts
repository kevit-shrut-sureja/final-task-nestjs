import { PartialType } from '@nestjs/mapped-types'
import { CreateBranchDTO } from './create-branch.dto';

export class UpdateBranchDTO extends PartialType(CreateBranchDTO){}