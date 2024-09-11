import { FilterQuery, Model, Types } from 'mongoose';
import { User, UserDocument } from './users.schema';
import { InjectModel } from '@nestjs/mongoose';
import { HttpException, HttpStatus, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ROLE } from '../constants';
import { CreateUserDTO, UpdateUserDTO, VacantSeatQueryDTO } from './dtos';
import { getObjectID } from '../utils/helper-functions';

@Injectable()
export class UserRepository {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

    async createUser(userData: CreateUserDTO): Promise<User> {
        try {
            const validatedUserData = this.validateRoleSpecificDetails<CreateUserDTO>(userData);
            return await this.userModel.create(validatedUserData);
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
            return await this.userModel.findOne({ email });
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new ServiceUnavailableException();
        }
    }

    async findUserById(id: string): Promise<UserDocument> {
        try {
            return this.userModel.findById(id);
        } catch (error) {
            throw new ServiceUnavailableException();
        }
    }

    async findUsersByBranchId(branchId: string): Promise<User[]> {
        try {
            return await this.userModel.find({ branchId: getObjectID(branchId) });
        } catch (error) {
            throw new ServiceUnavailableException();
        }
    }

    async findTotalNumberOfStudentsInABranch(branchId: Types.ObjectId) {
        try {
            return await this.userModel.find({ role: ROLE.STUDENT, branchId }).countDocuments();
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

    async findStudentById(id: string) {
        try {
            return await this.userModel.findOne({ _id: new Types.ObjectId(id), role: ROLE.STUDENT });
        } catch (error) {
            throw new ServiceUnavailableException();
        }
    }

    async updatedUser(user: User, editedUser: UpdateUserDTO): Promise<User> {
        try {
            const fields = Object.keys(editedUser);
            const updatedUserDetails = user;
            fields.forEach((field) => {
                updatedUserDetails[field] = editedUser[field];
            });
            const validatedUserData = this.validateRoleSpecificDetails<UpdateUserDTO>(updatedUserDetails);
            return await this.userModel.findByIdAndUpdate((user as UserDocument)._id, validatedUserData, { new: true });
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

    async updateUserTokens(user: User, tokens: string[]) {
        try {
            let updatedUser = user;
            updatedUser.tokens = tokens;
            return await this.userModel.findByIdAndUpdate((user as UserDocument)._id, updatedUser, { new: true });
        } catch (error) {
            throw new ServiceUnavailableException();
        }
    }

    async findOneUser(query : FilterQuery<UserDocument>){
        try {
            return await this.userModel.findOne(query)
        } catch (error) {
            throw new ServiceUnavailableException()
        }
    }

    validateRoleSpecificDetails<T extends CreateUserDTO | UpdateUserDTO>(user: T): T {
        const { role } = user;

        switch (role) {
            case ROLE.STUDENT: {
                const requiredFieldsForUser = ['branchId', 'phone', 'batch', 'currentSemester', 'branchName'];
                const missingUserFields = requiredFieldsForUser.filter((field) => !user[field]);

                if (missingUserFields.length) {
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

    async getBatchWiseAnalysis(): Promise<any[]> {
        try {
            return await this.userModel.aggregate([
                {
                    $match: {
                        role: 'student',
                    },
                },
                {
                    $lookup: {
                        from: 'branches',
                        localField: 'branchId',
                        foreignField: '_id',
                        pipeline: [
                            {
                                $project: {
                                    _id: 0,
                                    totalStudentsIntake: 1,
                                },
                            },
                        ],
                        as: 'branchDetails',
                    },
                },
                {
                    $addFields: {
                        branchDetails: {
                            $arrayElemAt: ['$branchDetails', 0],
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        branchName: '$branchName',
                        totalStudentsIntake: '$branchDetails.totalStudentsIntake',
                        batch: '$batch',
                    },
                },
                {
                    $group: {
                        _id: {
                            branch: '$branchName',
                            batch: '$batch',
                        },
                        totalStudentsBranchWise: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $group: {
                        _id: '$_id.batch',
                        totalStudents: {
                            $sum: '$totalStudentsBranchWise',
                        },
                        branches: {
                            $push: {
                                branch: '$_id.branch',
                                total: '$totalStudentsBranchWise',
                            },
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        batch: '$_id',
                        totalStudents: 1,
                        branches: {
                            $arrayToObject: {
                                $map: {
                                    input: '$branches',
                                    as: 'branch',
                                    in: {
                                        k: '$$branch.branch',
                                        v: '$$branch.total',
                                    },
                                },
                            },
                        },
                    },
                },
            ]);
        } catch (error) {
            throw new ServiceUnavailableException();
        }
    }

    async getVacantAnalysis(query: VacantSeatQueryDTO): Promise<any[]> {
        const { batch, branchName } = query;
        try {
            const stages: any = [
                {
                    $match: {
                        role: 'student',
                    },
                },
                {
                    $lookup: {
                        from: 'branches',
                        localField: 'branchId',
                        foreignField: '_id',
                        pipeline: [
                            {
                                $project: {
                                    _id: 0,
                                    totalStudentsIntake: 1,
                                },
                            },
                        ],
                        as: 'branchDetails',
                    },
                },
                {
                    $addFields: {
                        branchDetails: {
                            $arrayElemAt: ['$branchDetails', 0],
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        branchName: '$branchName',
                        totalStudentsIntake: '$branchDetails.totalStudentsIntake',
                        batch: '$batch',
                    },
                },
                {
                    $group: {
                        _id: {
                            branch: '$branchName',
                            batch: '$batch',
                        },
                        totalStudents: {
                            $sum: 1,
                        },
                        totalStudentsIntake: {
                            $first: '$totalStudentsIntake',
                        },
                    },
                },
                {
                    $group: {
                        _id: '$_id.batch',
                        totalStudents: {
                            $sum: '$totalStudents',
                        },
                        totalStudentsIntake: {
                            $sum: '$totalStudentsIntake',
                        },
                        totalVacantSeats: {
                            $sum: {
                                $subtract: ['$totalStudentsIntake', '$totalStudents'],
                            },
                        },
                        branches: {
                            $push: {
                                branch: '$_id.branch',
                                totalStudents: '$totalStudents',
                                totalStudentsIntake: '$totalStudentsIntake',
                                totalVacantSeats: {
                                    $subtract: ['$totalStudentsIntake', '$totalStudents'],
                                },
                            },
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        batch: '$_id',
                        totalStudents: 1,
                        totalStudentsIntake: 1,
                        totalVacantSeats: 1,
                        branches: {
                            $arrayToObject: {
                                $map: {
                                    input: '$branches',
                                    as: 'branch',
                                    in: {
                                        k: '$$branch.branch',
                                        v: {
                                            totalStudents: '$$branch.totalStudents',
                                            totalStudentsIntake: '$$branch.totalStudentsIntake',
                                            totalVacantSeats: '$$branch.totalVacantSeats',
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            ];
            const matchStage = {};
            if (branchName) {
                // eslint-disable-next-line
                matchStage['branchName'] = branchName;
            }
            if (batch) {
                // eslint-disable-next-line
                matchStage['batch'] = batch;
            }
            if (Object.keys(matchStage).length > 0) {
                const stageToAdd = {};
                // eslint-disable-next-line
                stageToAdd['$match'] = matchStage;
                stages.splice(4, 0, stageToAdd);
            }

            return await this.userModel.aggregate(stages);
        } catch (error) {
            throw new ServiceUnavailableException();
        }
    }
}
