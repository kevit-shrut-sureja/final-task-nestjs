import { HttpException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Branch, BranchDocument } from './branch.schema';
import { Model } from 'mongoose';

@Injectable()
export class BranchRepository {
    constructor(@InjectModel(Branch.name) private branchModel: Model<BranchDocument>) {}

    async createBranch(newBranch: Branch): Promise<Branch> {
        try {
            return await this.branchModel.create(newBranch);
        } catch (error) {
            if (error.code === 11000) {
                throw new HttpException('Branch already exists', 400);
            }

            throw new ServiceUnavailableException();
        }
    }

    async findBranchById(id: string): Promise<BranchDocument> {
        try {
            const branch = await this.branchModel.findById(id);

            if (!branch) {
                throw new HttpException('Branch not found.', 404);
            }

            return branch;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new ServiceUnavailableException();
        }
    }

    async findBranch(match: any, sort: any, limit: number, skip: number): Promise<Branch[]> {
        try {
            return await this.branchModel.find(match).sort(sort).limit(limit).skip(skip);
        } catch (error) {
            throw new ServiceUnavailableException();
        }
    }

    async deleteUserBranch(branch: BranchDocument) {
        try {
            return await branch.deleteOne();
        } catch (error) {
            throw new ServiceUnavailableException();
        }
    }
}