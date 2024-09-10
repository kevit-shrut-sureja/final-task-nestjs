import { Types } from 'mongoose';
import { ROLE } from '../../src/constants';
import { User, UserDocument } from '../../src/users/users.schema';
import { getObjectID } from '../../src/utils/helper-functions';
import { BRANCH_NAME_TYPE, branchData } from './branch.seed';
import { Branch, BranchDocument } from '../../src/branch/branch.schema';
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
    branchId?: Types.ObjectId,
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
        branchId,
        ...additionalFields,
    }) as T;

// Super admin data
export const superAdminData = <T extends User | UserDocument>(): T => createUser<T>(ROLE.SUPER_ADMIN, 'super-admin@email.com', 'super-admin');

// Admin data
export const adminData = <T extends User | UserDocument>(): T => createUser<T>(ROLE.ADMIN, 'admin@email.com', 'admin');

// Staff data by branch
export const staffData = <T extends User | UserDocument>(): Record<BRANCH_NAME_TYPE, T[]> => ({
    CE: [
        createUser<T>(ROLE.STAFF, 'staff-ce-1@email.com', 'staff-ce-1', branchData<BranchDocument>().CE._id),
        createUser<T>(ROLE.STAFF, 'staff-ce-2@email.com', 'staff-ce-2', branchData<BranchDocument>().CE._id),
    ],
    IT: [createUser<T>(ROLE.STAFF, 'staff-it-1@email.com', 'staff-it-1', branchData<BranchDocument>().IT._id)],
});

// Student data by branch
export const studentData = <T extends User | UserDocument>(): Record<BRANCH_NAME_TYPE, T[]> => ({
    CE: [
        createUser<T>(ROLE.STUDENT, 'student-ce-1@email.com', 'student-ce-1', branchData<BranchDocument>().CE._id, {
            batch: branchData<Branch>().CE.batch,
            branchName: branchData<Branch>().CE.name,
            currentSemester: 6,
            phone,
        }),
        createUser<T>(ROLE.STUDENT, 'student-ce-2@email.com', 'student-ce-2', branchData<BranchDocument>().CE._id, {
            batch: branchData<Branch>().CE.batch,
            branchName: branchData<Branch>().CE.name,
            currentSemester: 6,
            phone,
        }),
    ],
    IT: [
        createUser<T>(ROLE.STUDENT, 'student-it-1@email.com', 'student-it-1', branchData<BranchDocument>().IT._id, {
            batch: branchData<Branch>().IT.batch,
            branchName: branchData<Branch>().IT.name,
            currentSemester: 6,
            phone,
        }),
    ],
});
