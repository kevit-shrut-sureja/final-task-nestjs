import { mock } from 'jest-mock-extended';
import { AccessControlService } from '../access-control/access-control.service';
import { BranchRepository } from '../branch/branch.repository';
import { UserRepository } from './users.repository';
import { UsersService } from './users.service';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from './users.schema';
import { RoleType } from '../constants';
import { Branch, BranchDocument } from '../branch/branch.schema';
import { getNewObjectID } from '../utils/helper-functions';

describe('UsersService', () => {
    let usersService: UsersService;
    let userRepository: jest.Mocked<UserRepository>;
    let branchRepository: jest.Mocked<BranchRepository>;
    let accessControlService: jest.Mocked<AccessControlService>;

    beforeEach(async () => {
        const mockUserRepository = mock<UserRepository>();
        const mockBranchRepository = mock<BranchRepository>();
        const mockAccessControlService = mock<AccessControlService>();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: UserRepository,
                    useValue: mockUserRepository,
                },
                {
                    provide: BranchRepository,
                    useValue: mockBranchRepository,
                },
                {
                    provide: AccessControlService,
                    useValue: mockAccessControlService,
                },
            ],
        }).compile();

        usersService = module.get<UsersService>(UsersService);
        userRepository = module.get<UserRepository, jest.Mocked<UserRepository>>(UserRepository);
        branchRepository = module.get<BranchRepository, jest.Mocked<BranchRepository>>(BranchRepository);
        accessControlService = module.get<AccessControlService, jest.Mocked<AccessControlService>>(AccessControlService);
    });

    it('should be defined', () => {
        expect(usersService).toBeDefined();
        expect(userRepository).toBeDefined();
        expect(branchRepository).toBeDefined();
        expect(accessControlService).toBeDefined();
    });



    const branches: Record<string,BranchDocument> = {
        CE : {
            name : 'CE',
            batch : 2022,
            totalStudentsIntake : 1,
            _id : getNewObjectID()
        } as unknown as BranchDocument,
        IT : {
            name : 'IT',
            batch : 2022,
            totalStudentsIntake : 1,
            _id : getNewObjectID()
        } as unknown as BranchDocument,
    }


    const authedUser: Record<RoleType, User[]> = {
        admin: [
            {
                email: 'admin@email.com',
                name: 'Admin',
                password: 'This is user password',
                role: 'admin',
            },
        ],
        'super-admin': [
            {
                email: 'super-admin@email.com',
                name: 'super admin',
                password: 'This is user password',
                role: 'super-admin',
            },
        ],
        staff: [
            {
                email: 'staff-ce@email.com',
                name: 'staff-ce',
                password: 'This is user password',
                role: 'staff',
                branchId : branches.CE._id
            },
            {
                email: 'staff-it@email.com',
                name: 'staff-it',
                password: 'This is user password',
                role: 'staff',
                branchId : branches.IT._id
            },
        ],
        student: [
            {
                email: 'student-ce-1@email.com',
                name: 'student-ce-1',
                password: 'This is user password',
                role: 'student',
                branchId : branches.CE._id,
                batch : branches.CE.batch,
                branchName : branches.CE.name,
                phone : "1234567890"
            },
            {
                email: 'student-it-1@email.com',
                name: 'student-it-1',
                password: 'This is user password',
                role: 'student',
                branchId : branches.IT._id,
                batch : branches.IT.batch,
                branchName : branches.IT.name,
                phone : "1234567890"
            },
        ],
    };
    describe.skip('createNewUser', () => {});
    describe.skip('getUsers', () => {});
    describe.skip('getUserById', () => {});
    describe.skip('deleteUserWithId', () => {});
    describe.skip('updateUser', () => {});
    describe.skip('batchAnalysis', () => {});
    describe.skip('vacantAnalysis', () => {});
});
