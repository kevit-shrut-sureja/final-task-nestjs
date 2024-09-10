import { Branch, BranchDocument } from '../../src/branch/branch.schema';
import { getObjectID } from '../../src/utils/helper-functions';

export enum BRANCH_NAME {
    CE = 'CE',
    IT = 'IT',
}
export type BRANCH_NAME_TYPE = `${BRANCH_NAME}`;

const createBranch = <T extends Branch | BranchDocument>(name: string, batch: number, totalStudentsIntake: number, description?: string): T =>
    ({
        _id: getObjectID(),
        batch,
        name,
        totalStudentsIntake,
        description,
    }) as T;

export const branchData = <T extends Branch | BranchDocument>(): Record<BRANCH_NAME_TYPE, T> => ({
    CE: createBranch<T>(BRANCH_NAME.CE, 2022, 2, 'This is the branch description'),
    IT: createBranch<T>(BRANCH_NAME.IT, 2022, 2, 'This is the branch description'),
});
