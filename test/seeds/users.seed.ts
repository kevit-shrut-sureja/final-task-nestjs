import { Types } from 'mongoose';
import { ROLE } from '../../src/constants';
import { User, UserDocument } from '../../src/users/users.schema';
import { getObjectID } from '../../src/utils/helper-functions';
import { BRANCH_NAME_TYPE, branchDataDocument, } from './branch.seed';
import * as dotenv from 'dotenv';
import { JwtService } from '@nestjs/jwt';

dotenv.config({ path: '.env.test.local' });

const password = 'kevit@123'; // common password used between all
const phone = '1234567890';

export function generateAuthToken(payload) {
    const privateKey = Buffer.from(process.env.PRIVATE_KEY, 'base64').toString('utf-8');
    const jwtService: JwtService = new JwtService({ privateKey, signOptions: { algorithm: 'RS256' } });
    const token = jwtService.sign(payload);
    return token;
}

// Helper function for creating a user object
const createUser = <T extends User | UserDocument>(
    role: ROLE,
    email: string,
    name: string,
    additionalFields: Partial<User> = {},
    id: Types.ObjectId = getObjectID(),
): T =>
    ({
        _id: id,
        email,
        name,
        password,
        tokens: [generateAuthToken({ id, role })],
        role,
        ...additionalFields,
    }) as T;

// Super admin data
const createSuperAdminData = <T extends User | UserDocument>(): T => createUser<T>(ROLE.SUPER_ADMIN, 'super-admin@email.com', 'super-admin');

// Admin data
const createAdminData = <T extends User | UserDocument>(): T => createUser<T>(ROLE.ADMIN, 'admin@email.com', 'admin');

// Staff data by branch
const createStaffData = <T extends User | UserDocument>(): Record<BRANCH_NAME_TYPE, T[]> => ({
    CE: [
        createUser<T>(ROLE.STAFF, 'staff-ce-1@email.com', 'staff-ce-1', { branchId: branchDataDocument.CE._id }),
        createUser<T>(ROLE.STAFF, 'staff-ce-2@email.com', 'staff-ce-2', { branchId: branchDataDocument.CE._id }),
    ],
    IT: [createUser<T>(ROLE.STAFF, 'staff-it-1@email.com', 'staff-it-1', { branchId: branchDataDocument.IT._id })],
});

// Student data by branch
const createStudentData = <T extends User | UserDocument>(): Record<BRANCH_NAME_TYPE, T[]> => ({
    CE: [
        createUser<T>(ROLE.STUDENT, 'student-ce-1@email.com', 'student-ce-1', {
            branchId: branchDataDocument.CE._id,
            batch: branchDataDocument.CE.batch,
            branchName: branchDataDocument.CE.name,
            currentSemester: 6,
            phone,
        }),
        createUser<T>(ROLE.STUDENT, 'student-ce-2@email.com', 'student-ce-2', {
            branchId: branchDataDocument.CE._id,
            batch: branchDataDocument.CE.batch,
            branchName: branchDataDocument.CE.name,
            currentSemester: 6,
            phone,
        }),
    ],
    IT: [
        createUser<T>(ROLE.STUDENT, 'student-it-1@email.com', 'student-it-1', {
            branchId: branchDataDocument.IT._id,
            batch: branchDataDocument.IT.batch,
            branchName: branchDataDocument.IT.name,
            currentSemester: 6,
            phone,
        }),
    ],
});

export const superAdminUserDocument: UserDocument = createSuperAdminData<UserDocument>();
export const adminUserDocument: UserDocument = createAdminData<UserDocument>();
export const staffUserDocument: Record<BRANCH_NAME_TYPE, UserDocument[]> = createStaffData<UserDocument>();
export const studentUserDocument: Record<BRANCH_NAME_TYPE, UserDocument[]> = createStudentData<UserDocument>();
