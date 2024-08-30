import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { BranchService } from './branch.service';
import { CreateBranchDTO } from './dtos/create-branch.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { AccessControlGuard } from 'src/access-control/access-control.guard';
import { AccessControl } from 'src/access-control/decorator/access-control.decorator';
import { OPERATIONS, RESOURCE } from 'src/constants/role.constants';
import { Branch, BranchDocument } from './branch.schema';
import { GetBranchQueryDTO } from './dtos/get-branch-query.dto';
import { UpdateBranchDTO } from './dtos/update-branch.dto';

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
        const { sortBy, matchBy, order, skip, limit } = query;

        const sort: Record<string, 1 | -1> = {
            [sortBy as string]: order === 'asce' ? 1 : -1,
        };

        const match = {};

        // eslint-disable-next-line
        if (matchBy) match['$or'] = [{ name: new RegExp(matchBy as string, 'i') }];

        return await this.branchService.findBranch(match, sort, Number(limit), Number(skip));
    }

    @Delete(':id')
    @AccessControl(OPERATIONS.DELETE, RESOURCE.BRANCH)
    async deleteBranch(@Param('id') id: string) {
        return await this.branchService.deleteBranch(id);
    }

    @Put(':id')
    @AccessControl(OPERATIONS.UPDATE, RESOURCE.BRANCH)
    async updateBranch(@Param('id') id : string, @Body() updateBranchDto : UpdateBranchDTO){
        return await this.branchService.updateBranch(id, updateBranchDto)
    }
}
