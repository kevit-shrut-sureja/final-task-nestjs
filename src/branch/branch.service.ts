import { HttpException, Injectable } from '@nestjs/common';
import { BranchRepository } from './branch.repository';
import { Branch } from './branch.schema';
import { UserRepository } from 'src/users/users.repository';

@Injectable()
export class BranchService {
    constructor(
        private readonly branchRepository: BranchRepository,
        private readonly usersRepository: UserRepository,
    ) {}

    async createNewBranch(newBranch: Branch): Promise<Branch> {
        return await this.branchRepository.createBranch(newBranch);
    }

    async findBranchById(id: string): Promise<Branch> {
        return await this.branchRepository.findBranchById(id);
    }

    async findBranch(match: any, sort: any, limit: number, skip: number): Promise<Branch[]> {
        return await this.branchRepository.findBranch(match, sort, limit, skip);
    }

    async deleteBranch(id: string): Promise<Branch> {
        // awaiting if the branch exists or not
        const branch = await this.branchRepository.findBranchById(id);

        const usersWithBranchId = await this.usersRepository.findUsersByBranchId(id);
        if (usersWithBranchId.length > 0) {
            throw new HttpException('Users exists with this branch id so cannot delete branch.', 409);
        }

        await this.branchRepository.deleteUserBranch(branch);

        return branch;
    }
}
