import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { BranchService } from './branch.service';
import { CreateBranchDTO } from './dtos/create-branch.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { AccessControlGuard } from 'src/access-control/access-control.guard';
import { AccessControl } from 'src/access-control/decorator/access-control.decorator';
import { OPERATIONS, RESOURCE } from 'src/constants/role.constants';
import { Branch, BranchDocument } from './branch.schema';

@Controller('branch')
@UseGuards(AuthGuard, AccessControlGuard)
export class BranchController {
    constructor(private readonly branchService: BranchService) {}

    @Post()
    @AccessControl(OPERATIONS.CREATE, RESOURCE.BRANCH)
    async createNewBranch(@Body() createBranchDto: CreateBranchDTO) : Promise<Branch> {
        return await this.branchService.createNewBranch(createBranchDto);
    }
}
