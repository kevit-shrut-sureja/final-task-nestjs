// first storing the branch data

import mongoose from 'mongoose';
import { BranchDocument, BranchSchema } from '../../src/branch/branch.schema';
import { branchData } from '../seeds/branch.seed';
import { UserDocument, UserSchema } from '../../src/users/users.schema';
import { adminData, staffData, studentData, superAdminData } from '../seeds/users.seed';

const storeBranchData = async () => {
    const branchModel = mongoose.model('Branch', BranchSchema);

    await branchModel.create([branchData<BranchDocument>().CE, branchData<BranchDocument>().IT]);
};

const storeUsersData = async () => {
    const userModel = mongoose.model('User', UserSchema);

    // storing super admin
    await userModel.create(superAdminData<UserDocument>());

    // storing admin data
    await userModel.create(adminData<UserDocument>());

    // storing staff data
    await userModel.create([...staffData<UserDocument>().CE, ...staffData<UserDocument>().IT]);

    // storing student data
    await userModel.create([...studentData<UserDocument>().CE, ...studentData<UserDocument>().IT]);
};

export async function clearAndStoreDummyData() {
    await mongoose.connection.dropDatabase();
    await storeBranchData();
    await storeUsersData();
}
