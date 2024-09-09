import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { BranchService } from './branch.service';
import { CreateBranchDTO, GetBranchQueryDTO, UpdateBranchDTO } from './dtos';
import { Branch } from './branch.schema';
import { OPERATIONS, RESOURCE } from '../constants';
import { AuthGuard } from '../auth/auth.guard';
import { AccessControlGuard } from '../access-control/access-control.guard';
import { AccessControl } from '../access-control/decorator';

@Controller('branch')
@UseGuards(AuthGuard, AccessControlGuard)
export class BranchController {
    constructor(private readonly branchService: BranchService) {}

    @Post()
    @AccessControl(OPERATIONS.CREATE, RESOURCE.BRANCH)
    async createNewBranch(@Body() createBranchDto: CreateBranchDTO): Promise<Branch> {
        return await this.branchService.createNewBranch(createBranchDto);
    }

    @Get(':id')
    @AccessControl(OPERATIONS.READ, RESOURCE.BRANCH)
    async getBranchWithId(@Param('id') id: string): Promise<Branch> {
        return await this.branchService.findBranchById(id);
    }

    @Get()
    @AccessControl(OPERATIONS.READ, RESOURCE.BRANCH)
    async getBranch(@Query() query: GetBranchQueryDTO) {
        return await this.branchService.findBranch(query);
    }

    @Delete(':id')
    @AccessControl(OPERATIONS.DELETE, RESOURCE.BRANCH)
    async deleteBranch(@Param('id') id: string) {
        return await this.branchService.deleteBranch(id);
    }

    @Put(':id')
    @AccessControl(OPERATIONS.UPDATE, RESOURCE.BRANCH)
    async updateBranch(@Param('id') id: string, @Body() updateBranchDto: UpdateBranchDTO) {
        return await this.branchService.updateBranch(id, updateBranchDto);
    }
}
