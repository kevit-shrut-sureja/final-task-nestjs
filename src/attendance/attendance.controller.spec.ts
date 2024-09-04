import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AttendanceRepository } from './attendance.repository';
import { UserRepository } from '../users/users.repository';
import { AuthGuard } from '../auth/auth.guard';
import { AccessControlGuard } from '../access-control/access-control.guard';
import { GetAbsentStudentsListDTO, GetAttendancePercentageDTO } from './dtos';
import { mock } from 'jest-mock-extended';

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

    describe.skip('createAttendance', () => {});
    describe.skip('editAttendance', () => {});
    describe.skip('deleteAttendance', () => {});
    
});
