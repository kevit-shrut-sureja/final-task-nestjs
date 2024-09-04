import { Attendance } from "../attendance/attendance.schema"

export interface PartialAttendanceType {
    successRecords : Attendance[], 
    failedRecords ?: {
        record : Attendance, 
        error : string
    }[]
}