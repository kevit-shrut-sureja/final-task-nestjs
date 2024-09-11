import { HttpException, Injectable } from '@nestjs/common';
import { BranchRepository } from './branch.repository';
import { Branch } from './branch.schema';
import { GetBranchQueryDTO, UpdateBranchDTO } from './dtos';
import { UserRepository } from '../users/users.repository';
import { Types } from 'mongoose';

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
        const branch = await this.branchRepository.findBranchById(id);
        if (!branch) {
            throw new HttpException('Branch not found.', 404);
        }
        return branch;
    }

    async findBranch(query: GetBranchQueryDTO): Promise<Branch[]> {
        const { sortBy, matchBy, order, skip, limit } = query;

        const sort: Record<string, 1 | -1> = {
            [sortBy as string]: order === 'asce' ? 1 : -1,
        };

        const match = {};

        // eslint-disable-next-line
        if (matchBy) match['$or'] = [{ name: new RegExp(matchBy as string, 'i') }];
        return await this.branchRepository.findBranch(match, sort, limit, skip);
    }

    async deleteBranch(id: string): Promise<Branch> {
        // findind users for the branch
        const usersWithBranchId = await this.usersRepository.findUsersByBranchId(new Types.ObjectId(id));
        if (usersWithBranchId.length > 0) {
            throw new HttpException('Users exists with this branch id so cannot delete branch.', 409);
        }

        const branch = await this.branchRepository.deleteUserBranch(id);
        if (!branch) {
            throw new HttpException('Branch not found.', 404);
        }

        return branch;
    }

    async updateBranch(id: string, editedBranch: UpdateBranchDTO): Promise<Branch> {
        const branch = await this.branchRepository.findBranchById(id);
        if (!branch) {
            throw new HttpException('Branch not found.', 404);
        }

        if (editedBranch.batch !== branch.batch || editedBranch.name !== branch.name) {
            const usersWithBranchId = await this.usersRepository.findUsersByBranchId(new Types.ObjectId(id));
            // since users are using the branchName and batch cant update this
            if (usersWithBranchId.length > 0) {
                throw new HttpException('Users exists with this branch id so cannot update batch or name.', 409);
            }
        }

        if (editedBranch.totalStudentsIntake < branch.totalStudentsIntake) {
            const currentTotalStudents = await this.usersRepository.findTotalNumberOfStudentsInABranch(new Types.ObjectId(id));
            if (currentTotalStudents > editedBranch.totalStudentsIntake) {
                throw new HttpException('Current number of total students are more than updated number of total students intake.', 409);
            }
        }

        const updatedBranch = await this.branchRepository.updateBranch(branch, editedBranch);
        return updatedBranch;
    }
}
