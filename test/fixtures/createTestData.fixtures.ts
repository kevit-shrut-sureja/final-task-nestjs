// first storing the branch data

import mongoose from 'mongoose';
import { BranchSchema } from '../../src/branch/branch.schema';
import { branchDataDocument } from '../seeds/branch.seed';
import { UserSchema } from '../../src/users/users.schema';
import { adminUserDocument, staffUserDocument, studentUserDocument, superAdminUserDocument } from '../seeds/users.seed';

const storeBranchData = async () => {
    const branchModel = mongoose.model('Branch', BranchSchema);

    await branchModel.create([branchDataDocument.CE, branchDataDocument.IT]);
};

const storeUsersData = async () => {
    const userModel = mongoose.model('User', UserSchema);

    // storing super admin
    await userModel.create(superAdminUserDocument);

    // storing admin data
    await userModel.create(adminUserDocument);

    // storing staff data
    await userModel.create([...staffUserDocument.CE, ...staffUserDocument.IT]);

    // storing student data
    await userModel.create([...studentUserDocument.CE, ...studentUserDocument.IT]);
};

export async function clearAndStoreDummyData() {
    await mongoose.connection.dropDatabase();
    await storeBranchData();
    await storeUsersData();
}
