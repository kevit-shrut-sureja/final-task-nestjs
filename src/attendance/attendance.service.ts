import { Injectable } from '@nestjs/common';
import { AttendanceRepository } from './attendance.repository';
import { Attendance } from './attendance.schema';
import { PartialAttendanceType } from 'src/types/attendance.types';
import { AttendanceDTO, GetAbsentStudentsListDTO, GetAttendancePercentageDTO } from './dtos';

@Injectable()
export class AttendanceService {
    constructor(private readonly attendanceRepository: AttendanceRepository) {}

    async createAttendance(data: AttendanceDTO[]): Promise<PartialAttendanceType> {

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

    async deleteAttendance(data: AttendanceDTO) : Promise<Attendance> {
        return await this.attendanceRepository.deleteAttendance(data);
    }

    async absentStudentList({ date, branch, batch, semester }: GetAbsentStudentsListDTO) {
        return await this.attendanceRepository.getAbsentStudentList(new Date(date), branch, Number(batch), Number(semester));
    }

    async getStudentsByAttendancePercentage({ percentage, batch, semester, branch }: GetAttendancePercentageDTO) {
        return await this.attendanceRepository.getStudentsByAttendancePercentage(Number(percentage), Number(batch), Number(semester), branch);
    }
}
