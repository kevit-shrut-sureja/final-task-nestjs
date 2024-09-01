import { Injectable } from '@nestjs/common';
import { AttendanceRepository } from './attendance.repository';
import { AttendanceDTO } from './dtos/create-attendance.dto';
import { Attendance } from './attendance.schema';
import { PartialAttendanceType } from 'src/types/attendance.types';
import { GetAbsentStudentsListDTO } from './dtos/absent-student-query.dto';
import { GetAttendancePercentageDTO } from './dtos/attendance-percentage-query.dto';

@Injectable()
export class AttendanceService {
    constructor(private readonly attendanceRepository: AttendanceRepository) {}

    async createAttendance(data: AttendanceDTO[] | AttendanceDTO): Promise<Attendance | PartialAttendanceType> {
        if (!(data instanceof Array)) {
            // add single data
            return await this.attendanceRepository.createSingleAttendance(data);
        }

        // pushing all the attendance
        const results = await Promise.allSettled(
            data.map(async (record) => {
                const promiseResult = this.attendanceRepository.createSingleAttendance(record);
                return promiseResult;
            }),
        );

        const successRecords = [];
        const failedRecords = [];

        for (let i = 0; i < results.length; i += 1) {
            const result = results[i];
            if (result.status === 'fulfilled') {
                successRecords.push(result);
            } else if (result.status === 'rejected') {
                failedRecords.push({
                    record: data[i],
                    error: result.reason,
                });
            }
        }

        if (failedRecords.length !== 0) {
            return { successRecords, failedRecords };
        }

        return { successRecords };
    }

    async editAttendance(data: AttendanceDTO) {
        return await this.attendanceRepository.editAttendance(data);
    }

    async deleteAttendance(data: AttendanceDTO) {
        return await this.attendanceRepository.deleteAttendance(data);
    }

    async absentStudentList({ date, branch, batch, semester }: GetAbsentStudentsListDTO) {
        return await this.attendanceRepository.getAbsentStudentList(new Date(date), branch, Number(batch), Number(semester));
    }

    async getStudentsByAttendancePercentage({ percentage, batch, semester, branch }: GetAttendancePercentageDTO) {
        return await this.attendanceRepository.getStudentsByAttendancePercentage(Number(percentage), Number(batch), Number(semester), branch);
    }
}
