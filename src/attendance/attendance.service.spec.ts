import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceRepository } from './attendance.repository';
import { AttendanceService } from './attendance.service';
import { AttendanceDTO, GetAbsentStudentsListDTO, GetAttendancePercentageDTO } from './dtos';
import { Types } from 'mongoose';
import { mock } from 'jest-mock-extended';
import { Attendance } from './attendance.schema';

/**
 * Helper Funciton
 */
export function getObjectID(id: string) {
    return new Types.ObjectId(id);
}

export function getDate(date: string) {
    return new Date(date);
}

describe('AttendanceService', () => {
    let attendanceService: AttendanceService;
    let attendanceRepository: jest.Mocked<AttendanceRepository>;

    beforeEach(async () => {
        const mockAttendanceRepository = mock<AttendanceRepository>();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AttendanceService,
                {
                    provide: AttendanceRepository,
                    useValue: mockAttendanceRepository,
                },
            ],
        }).compile();

        attendanceService = module.get<AttendanceService>(AttendanceService);
        attendanceRepository = module.get<AttendanceRepository, jest.Mocked<AttendanceRepository>>(AttendanceRepository);
    });

    it('should be defined', () => {
        expect(attendanceService).toBeDefined();
        expect(attendanceRepository).toBeDefined();
    });

    const dummyAttendance: Attendance[] = [
        {
            studentId: getObjectID('66d4b48ac71294301d3a18b7'),
            date: getDate('2024-10-01T00:00:00.000Z'),
            present: false,
        },
    ];

    describe('createAttendance', () => {
        it('should return success records when all records are created successfully', async () => {
            // Mock the repository method to resolve
            attendanceRepository.createSingleAttendance.mockResolvedValueOnce(dummyAttendance[0]);

            const attendanceDTO: AttendanceDTO[] = [
                {
                    studentId: getObjectID('66d4b48ac71294301d3a18b7'),
                    date: '2024-10-01',
                },
            ];

            const result = await attendanceService.createAttendance(attendanceDTO);

            expect(result).toHaveProperty('successRecords');
            expect(result).not.toHaveProperty('failedRecords');
            expect(attendanceRepository.createSingleAttendance).toHaveBeenCalledTimes(attendanceDTO.length);
        });

        it('should return success records and failed records when all the records are created partially', async () => {
            // Mock the repository method to resolve
            attendanceRepository.createSingleAttendance
                .mockResolvedValueOnce(dummyAttendance[0])
                .mockResolvedValueOnce(dummyAttendance[0])
                .mockRejectedValueOnce({
                    status: 'rejected',
                    reason: {
                        response: 'Student not found.',
                        status: 404,
                        message: 'Student not found.',
                        name: 'HttpException',
                    },
                })
                .mockRejectedValueOnce({
                    status: 'rejected',
                    reason: {
                        response: 'Student not found.',
                        status: 404,
                        message: 'Student not found.',
                        name: 'HttpException',
                    },
                });

            const attendanceDTO: AttendanceDTO[] = [
                {
                    studentId: new Types.ObjectId('66d4b48ac71294301d3a18b7'),
                    date: '2024-10-01',
                },
                {
                    studentId: new Types.ObjectId('66d4b48ac71294301d3a18b7'),
                    date: '2024-10-02',
                },
                {
                    studentId: new Types.ObjectId('66d4b48ac71294301d3a18b7'),
                    date: '2024-10-03',
                },
                {
                    studentId: new Types.ObjectId('66d4b48ac71294301d3a18b7'),
                    date: '2024-10-04',
                },
            ];

            const result = await attendanceService.createAttendance(attendanceDTO);

            expect(result).toHaveProperty('successRecords');
            expect(result).toHaveProperty('failedRecords');
            expect(result.successRecords).toHaveLength(2);
            expect(result.failedRecords).toHaveLength(2);
            expect(attendanceRepository.createSingleAttendance).toHaveBeenCalledTimes(attendanceDTO.length);
        });

        it('should return failed values for all', async () => {
            attendanceRepository.createSingleAttendance.mockRejectedValue({
                status: 'rejected',
                reason: {
                    response: 'Student not found.',
                    status: 404,
                    message: 'Student not found.',
                    name: 'HttpException',
                },
            });

            const attendanceDTO: AttendanceDTO[] = [
                {
                    studentId: new Types.ObjectId('66d4b48ac71294301d3a18b7'),
                    date: '2024-10-01',
                },
                {
                    studentId: new Types.ObjectId('66d4b48ac71294301d3a18b7'),
                    date: '2024-10-02',
                },
            ];

            const result = await attendanceService.createAttendance(attendanceDTO);

            expect(result).toHaveProperty('successRecords');
            expect(result).toHaveProperty('failedRecords');
            expect(result.successRecords).toHaveLength(0);
            expect(result.failedRecords).toHaveLength(2);
            expect(attendanceRepository.createSingleAttendance).toHaveBeenCalledTimes(attendanceDTO.length);
        });
    });

    describe('editAttendance', () => {
        const attendanceDTO: AttendanceDTO = {
            studentId: new Types.ObjectId('66d4b48ac71294301d3a18b7'),
            date: '2024-10-01',
            present: true,
        };

        it('should edit attendance successfully', async () => {
            attendanceRepository.editAttendance.mockResolvedValue(dummyAttendance[0]);

            const result = await attendanceService.editAttendance(attendanceDTO);

            expect(result).toBeDefined();
            expect(result.studentId.toHexString()).toBe(attendanceDTO.studentId.toHexString());
            expect(attendanceRepository.editAttendance).toHaveBeenCalledWith(attendanceDTO);
        });

        it('should throw error if attendace is not found', async () => {
            attendanceRepository.editAttendance.mockRejectedValue(new Error('Some error has occured'));

            await expect(attendanceService.editAttendance(attendanceDTO)).rejects.toThrow('Some error has occured');

            expect(attendanceRepository.editAttendance).toHaveBeenCalledWith(attendanceDTO);
        });
    });

    describe('deleteAttendance', () => {
        const attendanceDTO: AttendanceDTO = {
            studentId: new Types.ObjectId('66d4b48ac71294301d3a18b7'),
            date: '2024-10-01',
            present: true,
        };

        it('should delete the attendance record', async () => {
            attendanceRepository.deleteAttendance.mockResolvedValue(dummyAttendance[0]);

            const result = await attendanceService.deleteAttendance(attendanceDTO);

            expect(result).toBeDefined();
            expect(attendanceRepository.deleteAttendance).toHaveBeenCalledWith(attendanceDTO);
        });

        it('should throw error for non-existing record', async () => {
            attendanceRepository.deleteAttendance.mockRejectedValue(new Error('Value does not exist'));

            await expect(attendanceService.deleteAttendance(attendanceDTO)).rejects.toThrow('Value does not exist');

            expect(attendanceRepository.deleteAttendance).toHaveBeenCalledWith(attendanceDTO);
        });
    });

    describe('getAbsentStudentList', () => {
        const absentStudent: GetAbsentStudentsListDTO = {
            date: '2024-10-01',
            batch: 2020,
            semester: 4,
            branch: 'CE',
        };

        it('should fetch list of attendance record', async () => {
            attendanceRepository.getAbsentStudentList.mockResolvedValue([]);

            const result = await attendanceService.absentStudentList(absentStudent
            );

            expect(result).toBeInstanceOf(Array);
        });

        it('should throw error', async () => {
            attendanceRepository.getAbsentStudentList.mockRejectedValue(new Error('Cannot fetch the data'));

            const result = await expect(
                attendanceService.absentStudentList(absentStudent),
            ).rejects.toThrow('Cannot fetch the data');

            expect(result).not.toBeDefined();
        });
    });

    describe('getStudentsByAttendancePercentage', () => {
        const attendancePercentage: GetAttendancePercentageDTO = {
            percentage: 76,
            batch: 2020,
            semester: 4,
            branch: 'CE',
        };

        it('should get list the attendance record', async () => {
            attendanceRepository.getStudentsByAttendancePercentage.mockResolvedValue([]);

            const result = await attendanceService.getStudentsByAttendancePercentage(attendancePercentage);

            expect(result).toBeInstanceOf(Array);
        });

        it('should throw error', async () => {
            attendanceRepository.getStudentsByAttendancePercentage.mockRejectedValue(new Error('Cannot find the attendance'));

            const result = await expect(attendanceService.getStudentsByAttendancePercentage(attendancePercentage)).rejects.toThrow(
                'Cannot find the attendance',
            );

            expect(result).not.toBeDefined();
        });
    });
});
