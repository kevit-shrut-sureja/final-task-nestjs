import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AttendanceRepository } from './attendance.repository';
import { UserRepository } from '../users/users.repository';
import { AuthGuard } from '../auth/auth.guard';
import { AccessControlGuard } from '../access-control/access-control.guard';
import { AttendanceDTO, GetAbsentStudentsListDTO, GetAttendancePercentageDTO } from './dtos';
import { mock } from 'jest-mock-extended';
import { getDate, getObjectID } from './attendance.service.spec';
import { Attendance } from './attendance.schema';
import { Response } from 'express';

const mockAuthGuard = {
    canActivate: jest.fn(() => true),
};

const mockAccessControlGuard = {
    canActivate: jest.fn(() => true),
};

describe('AttendanceController', () => {
    let controller: AttendanceController;
    let service: jest.Mocked<AttendanceService>;

    beforeEach(async () => {
        const mockAttendanceService = mock<AttendanceService>();
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AttendanceController],
            providers: [
                { provide: AttendanceService, useValue: mockAttendanceService },
                {
                    provide: getRepositoryToken(AttendanceRepository),
                    useValue: {},
                },
                {
                    provide: getRepositoryToken(UserRepository),
                    useValue: {},
                },
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue(mockAuthGuard) // Mock AuthGuard
            .overrideGuard(AccessControlGuard)
            .useValue(mockAccessControlGuard) // Mock AccessControlGuard
            .compile();

        controller = module.get<AttendanceController>(AttendanceController);
        service = module.get<AttendanceService, jest.Mocked<AttendanceService>>(AttendanceService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    const dummyAttendance: Attendance[] = [
        {
            studentId: getObjectID('66d4b48ac71294301d3a18b7'),
            date: getDate('2024-10-01T00:00:00.000Z'),
            present: false,
        },
        {
            studentId: getObjectID('66d4b48ac71294301d3a18b7'),
            date: getDate('2024-10-01T00:00:00.000Z'),
            present: false,
        },
    ];
    describe('absentStudentList', () => {
        it('should get the list of absent students', async () => {
            const absentStudent: GetAbsentStudentsListDTO = {
                date: '2024-10-01',
                batch: 2020,
                semester: 4,
                branch: 'CE',
            };

            service.absentStudentList.mockResolvedValue([]);

            const result = await service.absentStudentList(absentStudent);

            expect(result).toBeInstanceOf(Array);
        });

        it('should throw error', async () => {
            const absentStudent: GetAbsentStudentsListDTO = {
                date: '2024-10-01',
                batch: 2020,
                semester: 4,
                branch: 'CE',
            };

            service.absentStudentList.mockRejectedValue(new Error('Cannot fetch the data'));

            await expect(service.absentStudentList(absentStudent)).rejects.toThrow('Cannot fetch the data');
        });
    });

    describe('getStudentsByAttendancePercentage', () => {
        it('should get list the attendance record', async () => {
            const attendancePercentage: GetAttendancePercentageDTO = {
                percentage: 76,
                batch: 2020,
                semester: 4,
                branch: 'CE',
            };

            service.getStudentsByAttendancePercentage.mockResolvedValue([]);

            const result = await service.getStudentsByAttendancePercentage(attendancePercentage);

            expect(result).toBeInstanceOf(Array);
        });

        it('should throw error', async () => {
            const attendancePercentage: GetAttendancePercentageDTO = {
                percentage: 76,
                batch: 2020,
                semester: 4,
                branch: 'CE',
            };

            service.getStudentsByAttendancePercentage.mockRejectedValue(new Error('Cannot find the attendance'));

            const result = await expect(service.getStudentsByAttendancePercentage(attendancePercentage)).rejects.toThrow('Cannot find the attendance');

            expect(result).not.toBeDefined();
        });
    });

    describe('createAttendance', () => {
        // Mock Response object
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        } as unknown as Response;

        it('should return success records when all records are created successfully', async () => {
            // Mock the repository method to resolve
            service.createAttendance.mockResolvedValueOnce({ successRecords: [dummyAttendance[0]], failedRecords: [] });

            const attendanceDTO: AttendanceDTO[] = [
                {
                    studentId: getObjectID('66d4b48ac71294301d3a18b7'),
                    date: '2024-10-01',
                },
            ];

            const result = await controller.createAttendance(attendanceDTO, res);

            expect(result.status).toHaveBeenCalledWith(201);
            expect(service.createAttendance).toHaveBeenCalledWith(attendanceDTO);
        });

        it('should return success records and failed records when all the records are created partially', async () => {
            // Mock the repository method to resolve
            const attendanceDTO: AttendanceDTO[] = [
                {
                    studentId: getObjectID('66d4b48ac71294301d3a18b7'),
                    date: '2024-10-01',
                },
                {
                    studentId: getObjectID('66d4b48ac71294301d3a18b7'),
                    date: '2024-10-02',
                },
                {
                    studentId: getObjectID('66d4b48ac71294301d3a18b7'),
                    date: '2024-10-03',
                },
                {
                    studentId: getObjectID('66d4b48ac71294301d3a18b7'),
                    date: '2024-10-04',
                },
            ];
            service.createAttendance.mockResolvedValueOnce({
                successRecords: dummyAttendance,
                failedRecords: [
                    { record: attendanceDTO[3], error: 'This is a error' },
                    { record: attendanceDTO[3], error: 'This is a error' },
                ],
            });


            const result = await controller.createAttendance(attendanceDTO, res);

            expect(result.status).toHaveBeenCalledWith(207);
            expect(service.createAttendance).toHaveBeenCalledWith(attendanceDTO);
        });

        it('should return failed values for all', async () => {
            const attendanceDTO: AttendanceDTO[] = [
                {
                    studentId: getObjectID('66d4b48ac71294301d3a18b7'),
                    date: '2024-10-01',
                },
                {
                    studentId: getObjectID('66d4b48ac71294301d3a18b7'),
                    date: '2024-10-02',
                },
            ];
            service.createAttendance.mockResolvedValueOnce({
                successRecords: [],
                failedRecords: [
                    { record: attendanceDTO[0], error: 'This is a error' },
                    { record: attendanceDTO[0], error: 'This is a error' },
                ],
            });

            const result = await controller.createAttendance(attendanceDTO, res);

            expect(result.status).toHaveBeenCalledWith(400);
            expect(service.createAttendance).toHaveBeenCalledWith(attendanceDTO);
        });
    });

    describe('editAttendance', () => {
        const attendanceDTO: AttendanceDTO = {
            studentId: getObjectID('66d4b48ac71294301d3a18b7'),
            date: '2024-10-01',
            present: true,
        };

        it('should edit attendance successfully', async () => {
            service.editAttendance.mockResolvedValue(dummyAttendance[0]);

            const result = await controller.editAttendance(attendanceDTO);

            expect(result).toBeDefined();
            expect(result.studentId.toHexString()).toBe(attendanceDTO.studentId.toHexString());
            expect(service.editAttendance).toHaveBeenCalledWith(attendanceDTO);
        });

        it('should throw error if attendace is not found', async () => {
            service.editAttendance.mockRejectedValue(new Error('Some error has occured'));

            await expect(controller.editAttendance(attendanceDTO)).rejects.toThrow('Some error has occured');

            expect(service.editAttendance).toHaveBeenCalledWith(attendanceDTO);
        });
    });
    describe('deleteAttendance', () => {
        const attendanceDTO: AttendanceDTO = {
            studentId: getObjectID('66d4b48ac71294301d3a18b7'),
            date: '2024-10-01',
            present: true,
        };

        it('should delete the attendance record', async () => {
            service.deleteAttendance.mockResolvedValue(dummyAttendance[0]);

            const result = await controller.deleteAttendance(attendanceDTO);

            expect(result).toBeDefined();
            expect(service.deleteAttendance).toHaveBeenCalledWith(attendanceDTO);
        });

        it('should throw error for non-existing record', async () => {
            service.deleteAttendance.mockRejectedValue(new Error('Value does not exist'));

            await expect(controller.deleteAttendance(attendanceDTO)).rejects.toThrow('Value does not exist');

            expect(service.deleteAttendance).toHaveBeenCalledWith(attendanceDTO);
        });
    });
});
