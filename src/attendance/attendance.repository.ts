import { HttpException, HttpStatus, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Attendance, AttendanceDocument } from './attendance.schema';
import { AttendanceDTO } from './dtos';
import { InjectModel } from '@nestjs/mongoose';
import { UserRepository } from '../users/users.repository';

@Injectable()
export class AttendanceRepository {
    private readonly logger = new Logger(AttendanceRepository.name);

    constructor(
        @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
        private readonly userRepository: UserRepository,
    ) {}

    async createSingleAttendance(data: AttendanceDTO): Promise<Attendance> {
        try {
            const studentExists = await this.userRepository.findStudentById(data.studentId.toString());
            if (!studentExists) {
                throw new HttpException('Student not found.', HttpStatus.NOT_FOUND);
            }
            return await this.attendanceModel.create({ ...data, studentId: new Types.ObjectId(data.studentId) });
        } catch (error) {
            this.logger.error(error);

            if (error.code === 11000) {
                throw new HttpException('Attendance already exists', HttpStatus.BAD_REQUEST);
            }

            if (error instanceof HttpException) {
                throw error;
            }

            throw new ServiceUnavailableException();
        }
    }

    async editAttendance({ date, studentId, present }: AttendanceDTO): Promise<Attendance> {
        try {
            const findAttendance = await this.attendanceModel.findOne({ date, studentId: new Types.ObjectId(studentId) });
            if (!findAttendance) {
                throw new HttpException('Attendance not found.', HttpStatus.NOT_FOUND);
            }
            findAttendance.present = present;
            return await findAttendance.save();
        } catch (error) {
            this.logger.error(error);

            if (error instanceof HttpException) {
                throw error;
            }

            throw new ServiceUnavailableException();
        }
    }

    async deleteAttendance({ date, studentId }: AttendanceDTO): Promise<Attendance> {
        try {
            const attendance = await this.attendanceModel.findOne({ date, studentId: new Types.ObjectId(studentId) });
            if (!attendance) {
                throw new HttpException('Attendance not found.', HttpStatus.NOT_FOUND);
            }
            return await this.attendanceModel.findOneAndDelete({ date, studentId: new Types.ObjectId(studentId) });
        } catch (error) {
            this.logger.error(error);

            if (error instanceof HttpException) {
                throw error;
            }

            throw new ServiceUnavailableException();
        }
    }

    async getAbsentStudentList(date: Date, branch?: string, batch?: number, semester?: number): Promise<any[]> {
        try {
            const stages: any = [
                {
                    $match: {
                        date,
                        present: false,
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'studentId',
                        foreignField: '_id',
                        as: 'studentDetails',
                        pipeline: [
                            {
                                $project: {
                                    _id: 0,
                                    name: 1,
                                    email: 1,
                                    branchName: '$branchName',
                                    batch: 'batch',
                                    currentSemester: '$currentSemester',
                                },
                            },
                        ],
                    },
                },
                {
                    $addFields: {
                        studentDetails: {
                            $arrayElemAt: ['$studentDetails', 0],
                        },
                    },
                },
                {
                    $project: {
                        studentName: '$studentDetails.name',
                        email: '$studentDetails.email',
                        date: 1,
                        present: 1,
                        _id: 0,
                        batch: '$studentDetails.batch',
                        branch: '$studentDetails.branchName',
                        semester: '$studentDetails.currentSemester',
                    },
                },
            ];
            const matchStage = {};
            if (branch) matchStage['studentDetails.branchName'] = branch;
            if (batch) matchStage['studentDetails.batch'] = batch;
            if (semester) matchStage['studentDetails.currentSemester'] = semester;
            if (Object.keys(matchStage).length > 0) {
                const stageToAdd = {};
                stageToAdd['$match'] = matchStage;
                stages.splice(3, 0, stageToAdd);
            }
            const result = await this.attendanceModel.aggregate(stages);
            return result;
        } catch (error) {
            this.logger.error(error);

            throw new ServiceUnavailableException();
        }
    }

    async getStudentsByAttendancePercentage(percentage: number, batch?: number, semester?: number, branch?: string): Promise<any[]> {
        try {
            const stages: any = [
                {
                    $group: {
                        _id: '$studentId',
                        totalPresent: {
                            $sum: {
                                $cond: [
                                    {
                                        $eq: ['$present', true],
                                    },
                                    1,
                                    0,
                                ],
                            },
                        },
                        totalDays: {
                            $sum: 1,
                        },
                        studentId: {
                            $first: '$studentId',
                        },
                    },
                },
                {
                    $addFields: {
                        attendancePercentage: {
                            $multiply: [
                                {
                                    $divide: ['$totalPresent', '$totalDays'],
                                },
                                100,
                            ],
                        },
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'studentId',
                        foreignField: '_id',
                        as: 'studentDetails',
                        pipeline: [
                            {
                                $project: {
                                    _id: 0,
                                    name: 1,
                                    email: 1,
                                    branchName: '$branchName',
                                    batch: '$batch',
                                    currentSemester: '$currentSemester',
                                },
                            },
                        ],
                    },
                },
                {
                    $addFields: {
                        studentDetails: {
                            $arrayElemAt: ['$studentDetails', 0],
                        },
                    },
                },
                {
                    $project: {
                        studentName: '$studentDetails.name',
                        email: '$studentDetails.email',
                        _id: 0,
                        batch: '$studentDetails.batch',
                        branch: '$studentDetails.branchName',
                        semester: '$studentDetails.currentSemester',
                        attendancePercentage: 1,
                        totalDays: 1,
                        totalDaysPresent: '$totalPresent',
                    },
                },
            ];
            // custom percentage
            stages.splice(2, 0, {
                $match: {
                    attendancePercentage: {
                        $lt: percentage,
                    },
                },
            });

            const matchStage = {};
            if (branch) matchStage['studentDetails.branchName'] = branch;
            if (batch) matchStage['studentDetails.batch'] = batch;
            if (semester) matchStage['studentDetails.currentSemester'] = semester;
            if (Object.keys(matchStage).length > 0) {
                const stageToAdd = {};
                stageToAdd['$match'] = matchStage;
                stages.splice(5, 0, stageToAdd);
            }

            const result = await this.attendanceModel.aggregate(stages);
            return result;
        } catch (error) {
            this.logger.error(error);

            throw new ServiceUnavailableException();
        }
    }
}
