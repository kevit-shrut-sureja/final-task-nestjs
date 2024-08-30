import { Model, Mongoose, Types } from 'mongoose';
import { User, UserDocument } from './users.schema';
import { InjectModel } from '@nestjs/mongoose';
import { HttpException, HttpStatus, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { CreateUserDTO } from './dtos/create-user.dto';
import { ROLE } from 'src/constants/role.constants';
import { UpdateUserDTO } from './dtos/update-user.dto';
import { fileURLToPath } from 'url';

@Injectable()
export class UserRepository {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

    async createUser(userData: CreateUserDTO): Promise<User> {
        try {
            const validatedUserData = this.validateRoleSpecificDetails(userData);
            validatedUserData.branchId = new Types.ObjectId(validatedUserData.branchId)
            const createdUser = await this.userModel.create(validatedUserData);
            return createdUser;
        } catch (error) {
            if (error.code === 11000) {
                throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
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
            return user;
        } catch (error) {
            console.log(error);

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
            const result = await this.userModel.find({ role: 'student', branchId: branchId }).countDocuments();
            return result;
        } catch (error) {
            throw new ServiceUnavailableException();
        }
    }

    async getUsers(match: any, sort: any, limit: number, skip: number): Promise<User[]> {
        try {
            return await this.userModel.find(match).sort(sort).limit(limit).skip(skip);
        } catch (error) {
            throw new ServiceUnavailableException();
        }
    }

    async deleteUserById(id: string) {
        try {
            return await this.userModel.findByIdAndDelete(id);
        } catch (error) {
            throw new ServiceUnavailableException();
        }
    }

    async updatedUser(user: UserDocument, editedUser: UpdateUserDTO): Promise<User> {
        try {
            const fields = Object.keys(editedUser);
            const updatedUserDetails = { ...user };
            fields.forEach((field) => {
                updatedUserDetails[field] = editedUser[field];
            });

            // Now merging the changes
            Object.assign(user, updatedUserDetails);
            return await user.save();
        } catch (error) {
            if (error.code === 11000) {
                throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
            }

            if (error instanceof HttpException) {
                throw error;
            }
            throw new ServiceUnavailableException();
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
                    throw new HttpException('Student details missing.', HttpStatus.BAD_REQUEST);
                }
                break;
            }
            case ROLE.STAFF: {
                const requiredFieldsForStaff = ['branchId'];
                const missingStaffFields = requiredFieldsForStaff.filter((field) => !user[field]);

                if (missingStaffFields.length) {
                    throw new HttpException('Staff details missing.', HttpStatus.BAD_REQUEST);
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
            case ROLE.SUPER_ADMIN: {
                user.branchId = undefined;
                user.phone = undefined;
                user.batch = undefined;
                user.currentSemester = undefined;
                user.branchName = undefined;
                break;
            }
            default: {
                throw new HttpException('User role missing.', HttpStatus.BAD_REQUEST);
            }
        }
        return user;
    }

    async getBatchWiseAnalysis() {
        try {
            const result = await this.userModel.aggregate();
            return result;
        } catch (error) {
            throw new ServiceUnavailableException();
        }
    }
}
