import { HttpException, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Branch, BranchDocument } from "./branch.schema";
import { Model } from "mongoose";

@Injectable()
export class BranchRepository{
    constructor(@InjectModel(Branch.name) private branchModel : Model<BranchDocument>){}

    async createBranch(newBranch : Branch) : Promise<Branch>{
        try {
            return await this.branchModel.create(newBranch)
        } catch (error) {
            if (error.code === 11000) {
                throw new HttpException('Branch already exists', 400);
            }

            throw new ServiceUnavailableException();
        }
    }
}