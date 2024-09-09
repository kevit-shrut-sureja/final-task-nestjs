import { Attendance } from '../attendance/attendance.schema';
import { AttendanceDTO } from '../attendance/dtos';

export interface PartialAttendanceType {
    successRecords: Attendance[];
    failedRecords?: {
        record: AttendanceDTO;
        error: string;
    }[];
}
