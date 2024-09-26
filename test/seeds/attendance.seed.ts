import { Attendance } from '../../src/attendance/attendance.schema';
import { BRANCH_NAME_TYPE } from './branch.seed';
import { studentUserDocument } from './users.seed';

export const attendanceData: Record<BRANCH_NAME_TYPE, Attendance[]> = {
    CE: [
        {
            date: new Date('2024-09-01'),
            studentId: studentUserDocument.CE[0]._id,
            present: true,
        },
        {
            date: new Date('2024-09-02'),
            studentId: studentUserDocument.CE[0]._id,
            present: false,
        },
        {
            date: new Date('2024-09-03'),
            studentId: studentUserDocument.CE[0]._id,
            present: true,
        },
        {
            date: new Date('2024-09-01'),
            studentId: studentUserDocument.CE[1]._id,
            present: true,
        },
        {
            date: new Date('2024-09-02'),
            studentId: studentUserDocument.CE[1]._id,
            present: true,
        },
        {
            date: new Date('2024-09-03'),
            studentId: studentUserDocument.CE[1]._id,
            present: false,
        },
    ],
    IT: [
        {
            date: new Date('2024-09-01'),
            studentId: studentUserDocument.IT[0]._id,
            present: false,
        },
        {
            date: new Date('2024-09-02'),
            studentId: studentUserDocument.IT[0]._id,
            present: true,
        },
        {
            date: new Date('2024-09-03'),
            studentId: studentUserDocument.IT[0]._id,
            present: true,
        },
    ],
};
