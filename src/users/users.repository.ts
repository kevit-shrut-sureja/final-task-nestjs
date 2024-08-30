import { Model } from 'mongoose';
import { User, UserDocument } from './users.schema';
import { InjectModel } from '@nestjs/mongoose';
import { HttpException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { CreateUserDTO } from './dtos/create-user.dto';
import { ROLE } from 'src/constants/role.constants';

@Injectable()
export class UserRepository {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

    async createUser(userData: CreateUserDTO): Promise<User> {
        try {
            const validatedUserData = this.validateRoleSpecificDetails(userData);
            const createdUser = await this.userModel.create(validatedUserData);
            return createdUser;
        } catch (error) {
            if (error.code === 11000) {
                throw new HttpException('User already exists', 400);
            }

            if (error instanceof HttpException) {
                throw error;
            }

            throw new ServiceUnavailableException();
        }
    }

    async findUserByEmail(email: string): Promise<UserDocument> {
        try {
            const user = await this.userModel.findOne({ email });
            if (!user) {
                throw new NotFoundException('User not found.');
            }
            return user;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new ServiceUnavailableException();
        }
    }

    async findUserById(id: string): Promise<UserDocument> {
        try {
            const user = this.userModel.findById(id);

            if (!user) {
                throw new NotFoundException('User not found');
            }
            return user;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new ServiceUnavailableException();
        }
    }

    async findUsersByBranchId(branchId: string) {
        try {
            return await this.userModel.find({ branchId });
        } catch (error) {
            throw new ServiceUnavailableException();
        }
    }

    async findTotalNumberOfStudentsInABranch(branchId: string) {
        try {
            const result = await this.userModel.find({ role: 'student', 'branchId' : branchId }).countDocuments()
            return result;
        } catch (error) {
            throw new ServiceUnavailableException()
        }
    }

    validateRoleSpecificDetails(user: CreateUserDTO): CreateUserDTO {
        const { role } = user;

        switch (role) {
            case ROLE.STUDENT: {
                const requiredFieldsForUser = ['branchId', 'phone', 'batch', 'currentSemester', 'branchName'];
                const missingUserFields = requiredFieldsForUser.filter((field) => !user[field]);

                if (missingUserFields.length) {
                    console.log('Throwing HttpException:', HttpException);
                    throw new HttpException('Student details missing.', 400);
                }
                break;
            }
            case ROLE.STAFF: {
                const requiredFieldsForStaff = ['branchId'];
                const missingStaffFields = requiredFieldsForStaff.filter((field) => !user[field]);

                if (missingStaffFields.length) {
                    throw new HttpException('Staff details missing.', 400);
                }

                // Clean up fields that are not needed for staff
                user.phone = undefined;
                user.batch = undefined;
                user.currentSemester = undefined;
                user.branchName = undefined;

                break;
            }
            case ROLE.ADMIN: {
                // Clean up fields that are not needed for admin
                user.branchId = undefined;
                user.phone = undefined;
                user.batch = undefined;
                user.currentSemester = undefined;
                user.branchName = undefined;

                break;
            }
            default: {
                throw new HttpException('User role missing.', 400);
            }
        }
        return user;
    }
}
