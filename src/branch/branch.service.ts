import { Injectable } from '@nestjs/common';
import { BranchRepository } from './branch.repository';
import { Branch } from './branch.schema';

@Injectable()
export class BranchService {
    constructor(private readonly branchRepository : BranchRepository){}

    async createNewBranch(newBranch : Branch) : Promise<Branch>{
        return await this.branchRepository.createBranch(newBranch)
    }
}
