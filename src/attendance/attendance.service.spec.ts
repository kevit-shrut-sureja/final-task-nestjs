import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceRepository } from './attendance.repository';
import { AttendanceService } from './attendance.service';
import { AttendanceDTO, GetAbsentStudentsListDTO, GetAttendancePercentageDTO } from './dtos';
import { Types } from 'mongoose';

describe('AttendanceService', () => {
    let attendanceService: AttendanceService;
    let attendanceRepository: AttendanceRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AttendanceService,
                {
                    provide: AttendanceRepository,
                    useValue: {
                        createSingleAttendance: jest.fn(),
                        editAttendance: jest.fn(),
                        deleteAttendance: jest.fn(),
                        getAbsentStudentList: jest.fn(),
                        getStudentsByAttendancePercentage: jest.fn(),
                    },
                },
            ],
        }).compile();

        attendanceService = module.get<AttendanceService>(AttendanceService);
        attendanceRepository = module.get<AttendanceRepository>(AttendanceRepository);
    });

    it('should be defined', () => {
        expect(attendanceService).toBeDefined();
        expect(attendanceRepository).toBeDefined();
    });

    describe('createAttendance', () => {
        it('should return success records when all records are created successfully', async () => {
            // Mock the repository method to resolve
            (attendanceRepository.createSingleAttendance as jest.Mock).mockResolvedValueOnce([
                {
                    status: 'fulfilled',
                    value: {
                        studentId: '66d5996f6aff78c7a36f3a11',
                        date: '2024-05-02T00:00:00.000Z',
                        present: false,
                        _id: '66d7106752e4b77f1bb81a6c',
                        createdAt: '2024-09-03T13:34:31.839Z',
                        updatedAt: '2024-09-03T13:34:31.839Z',
                        __v: 0,
                    },
                },
            ]);

            const attendanceDTO: AttendanceDTO[] = [
                {
                    studentId: new Types.ObjectId('66d4b48ac71294301d3a18b7'),
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
            (attendanceRepository.createSingleAttendance as jest.Mock)
                .mockResolvedValueOnce({
                    status: 'fulfilled',
                    value: {
                        studentId: '66d4b48ac71294301d3a18b7',
                        date: '2024-10-10T00:00:00.000Z',
                        present: false,
                        _id: '66d4be92157a89680012b5c2',
                        createdAt: '2024-09-01T19:20:50.180Z',
                        updatedAt: '2024-09-01T19:20:50.180Z',
                        __v: 0,
                    },
                })
                .mockResolvedValueOnce({
                    status: 'fulfilled',
                    value: {
                        studentId: '66d4b48ac71294301d3a18b7',
                        date: '2024-10-11T00:00:00.000Z',
                        present: true,
                        _id: '66d4be92157a89680012b5c6',
                        createdAt: '2024-09-01T19:20:50.185Z',
                        updatedAt: '2024-09-01T19:20:50.185Z',
                        __v: 0,
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
            // console.log(result)
            expect(result).toHaveProperty('successRecords');
            expect(result).toHaveProperty('failedRecords');
            expect(result.successRecords).toHaveLength(2);
            expect(result.failedRecords).toHaveLength(2);
            expect(attendanceRepository.createSingleAttendance).toHaveBeenCalledTimes(attendanceDTO.length);
        });

        it('should return failed values for all', async () => {
            (attendanceRepository.createSingleAttendance as jest.Mock).mockRejectedValue({
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
        it('should edit attendance successfully', async () => {
            const attendanceDTO: AttendanceDTO = {
                studentId: new Types.ObjectId('66d4b48ac71294301d3a18b7'),
                date: '2024-10-01',
                present: true,
            };

            (attendanceRepository.editAttendance as jest.Mock).mockResolvedValue({
                _id: '66d4b48cc71294301d3a1b5b',
                studentId: '66d4b48ac71294301d3a18b7',
                date: '2024-30-01T00:00:00.000Z',
                present: true,
                createdAt: '2024-09-01T18:38:04.728Z',
                updatedAt: '2024-09-01T18:43:12.273Z',
                __v: 0,
            });

            const result = await attendanceRepository.editAttendance(attendanceDTO);

            expect(result).toBeDefined();
            expect(result.studentId).toBe(attendanceDTO.studentId.toString());
            expect(attendanceRepository.editAttendance).toHaveBeenCalledWith(attendanceDTO);
        });

        it('should throw error if attendace is not found', async () => {
            const attendanceDTO: AttendanceDTO = {
                studentId: new Types.ObjectId('66d4b48ac71294301d3a18b7'),
                date: '2024-10-01',
                present: true,
            };

            (attendanceRepository.editAttendance as jest.Mock).mockRejectedValue(new Error('Some error has occured'));

            await expect(attendanceRepository.editAttendance(attendanceDTO)).rejects.toThrow('Some error has occured');

            expect(attendanceRepository.editAttendance).toHaveBeenCalledWith(attendanceDTO);
        });
    });

    describe('deleteAttendance', () => {
        it('should delete the attendance record', async () => {
            const attendanceDTO: AttendanceDTO = {
                studentId: new Types.ObjectId('66d4b48ac71294301d3a18b7'),
                date: '2024-10-01',
                present: true,
            };

            (attendanceRepository.deleteAttendance as jest.Mock).mockResolvedValue({
                _id: '66d4b48cc71294301d3a1b5b',
                studentId: '66d4b48ac71294301d3a18b7',
                date: '2024-30-01T00:00:00.000Z',
                present: true,
                createdAt: '2024-09-01T18:38:04.728Z',
                updatedAt: '2024-09-01T18:43:12.273Z',
                __v: 0,
            });

            const result = await attendanceRepository.deleteAttendance(attendanceDTO);

            expect(result).toBeDefined();
            expect(attendanceRepository.deleteAttendance).toHaveBeenCalledWith(attendanceDTO);
        });

        it('should throw error for non-existing record', async () => {
            const attendanceDTO: AttendanceDTO = {
                studentId: new Types.ObjectId('66d4b48ac71294301d3a18b7'),
                date: '2024-10-01',
                present: true,
            };

            (attendanceRepository.deleteAttendance as jest.Mock).mockRejectedValue(new Error('Value does not exist'));

            await expect(attendanceRepository.deleteAttendance(attendanceDTO)).rejects.toThrow('Value does not exist');

            expect(attendanceRepository.deleteAttendance).toHaveBeenCalledWith(attendanceDTO);
        });
    });

    describe('getAbsentStudentList', () => {
        it('should fetch list of attendance record', async () => {
            const absentStudent: GetAbsentStudentsListDTO = {
                date: '2024-10-01',
                batch: 2020,
                semester: 4,
                branch: 'CE',
            };

            (attendanceRepository.getAbsentStudentList as jest.Mock).mockResolvedValue([]);

            const result = await attendanceRepository.getAbsentStudentList(
                new Date(absentStudent.date),
                absentStudent.branch,
                absentStudent.batch,
                absentStudent.semester,
            );

            expect(result).toBeInstanceOf(Array);
        });

        it('should throw error', async () => {
            const absentStudent: GetAbsentStudentsListDTO = {
                date: '2024-10-01',
                batch: 2020,
                semester: 4,
                branch: 'CE',
            };

            (attendanceRepository.getAbsentStudentList as jest.Mock).mockRejectedValue(new Error('Cannot fetch the data'));

            const result = await expect(
                attendanceRepository.getAbsentStudentList(new Date(absentStudent.date), absentStudent.branch, absentStudent.batch, absentStudent.semester),
            ).rejects.toThrow('Cannot fetch the data');

            expect(result).not.toBeDefined();
        });
    });

    describe('getStudentsByAttendancePercentage', () => {
        it('should get list the attendance record', async () => {
            const attendancePercentage: GetAttendancePercentageDTO = {
                percentage : 76,
                batch: 2020,
                semester: 4,
                branch: 'CE',
            };

            (attendanceRepository.getStudentsByAttendancePercentage as jest.Mock).mockResolvedValue([]);

            const result = await attendanceRepository.getStudentsByAttendancePercentage(
                attendancePercentage.percentage,
                attendancePercentage.batch,
                attendancePercentage.semester,
                attendancePercentage.branch,
            );

            expect(result).toBeInstanceOf(Array);
        });

        it('should throw error', async () => {
            const attendancePercentage: GetAttendancePercentageDTO = {
                percentage : 76,
                batch: 2020,
                semester: 4,
                branch: 'CE',
            };

            (attendanceRepository.getStudentsByAttendancePercentage as jest.Mock).mockRejectedValue(new Error('Cannot find the attendance'));

            const result = await expect(
                attendanceRepository.getStudentsByAttendancePercentage(attendancePercentage.percentage, attendancePercentage.batch, attendancePercentage.semester, attendancePercentage.branch),
            ).rejects.toThrow('Cannot find the attendance');

            expect(result).not.toBeDefined();
        });
    });
});
