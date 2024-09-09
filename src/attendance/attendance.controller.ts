import { Body, Controller, Delete, Get, ParseArrayPipe, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceDTO, GetAbsentStudentsListDTO, GetAttendancePercentageDTO } from './dtos';
import { Response } from 'express';
import { Attendance } from './attendance.schema';
import { AccessControlGuard } from '../access-control/access-control.guard';
import { AuthGuard } from '../auth/auth.guard';
import { AccessControl } from '../access-control/decorator';
import { OPERATIONS, RESOURCE } from '../constants';

@Controller('attendance')
@UseGuards(AuthGuard, AccessControlGuard)
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) {}

    @Get('absentList')
    @AccessControl(OPERATIONS.READ, RESOURCE.ATTENDANCE)
    async absentStudentList(@Query() query: GetAbsentStudentsListDTO) {
        return await this.attendanceService.absentStudentList(query);
    }

    @Get('attendancePercentage')
    @AccessControl(OPERATIONS.READ, RESOURCE.ATTENDANCE)
    async getStudentsByAttendancePercentage(@Query() query: GetAttendancePercentageDTO) {
        return await this.attendanceService.getStudentsByAttendancePercentage(query);
    }

    @Post()
    @AccessControl(OPERATIONS.CREATE, RESOURCE.ATTENDANCE)
    // ParseArrayPipe to validate in the array see https://docs.nestjs.com/techniques/validation#parsing-and-validating-arrays
    async createAttendance(@Body(new ParseArrayPipe({ items: AttendanceDTO })) data: AttendanceDTO[], @Res() res: Response) {
        const result = await this.attendanceService.createAttendance(data);

        // check if both successRecords and failedRecords exist
        if (result.successRecords.length > 0 && 'failedRecords' in result && result.failedRecords.length > 0) {
            // Partial success
            return res.status(207).json({
                status: 'partial',
                message: 'Some records were successfully created, but some failed.',
                ...result,
            });
        }

        // in case, if all have failed
        if (result.successRecords.length === 0) {
            return res.status(400).json({
                status: 'failed',
                message: 'Due to some error no records have been saved successfully.',
                ...result,
            });
        }

        return res.status(201).json({
            status: 'success',
            message: 'All records were successfully created.',
            ...result,
        });
    }

    @Put()
    @AccessControl(OPERATIONS.UPDATE, RESOURCE.ATTENDANCE)
    async editAttendance(@Body() editedAttendance: AttendanceDTO) {
        return await this.attendanceService.editAttendance(editedAttendance);
    }

    @Delete()
    @AccessControl(OPERATIONS.DELETE, RESOURCE.ATTENDANCE)
    async deleteAttendance(@Body() deleteAttendance: AttendanceDTO): Promise<Attendance> {
        return await this.attendanceService.deleteAttendance(deleteAttendance);
    }
}
