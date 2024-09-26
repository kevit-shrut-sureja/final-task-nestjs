import { mock } from 'jest-mock-extended';
import { AccessControlService } from '../access-control/access-control.service';
import { BranchRepository } from '../branch/branch.repository';
import { UserRepository } from './users.repository';
import { UsersService } from './users.service';
import { Test, TestingModule } from '@nestjs/testing';
import { User, UserDocument } from './users.schema';
import { OPERATIONS, RESOURCE, RoleType } from '../constants';
import { BranchDocument } from '../branch/branch.schema';
import { getObjectID } from '../utils/helper-functions';
import { CreateUserDTO, GetUsersQueryDTO, UpdateUserDTO, VacantSeatQueryDTO } from './dtos';
import { ForbiddenException, HttpException, NotFoundException } from '@nestjs/common';

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

    const branches: Record<string, BranchDocument> = {
        CE: {
            name: 'CE',
            batch: 2022,
            totalStudentsIntake: 1,
            _id: getObjectID(),
        } as unknown as BranchDocument,
        IT: {
            name: 'IT',
            batch: 2022,
            totalStudentsIntake: 1,
            _id: getObjectID(),
        } as unknown as BranchDocument,
    };

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
                branchId: branches.CE._id,
            },
            {
                email: 'staff-it@email.com',
                name: 'staff-it',
                password: 'This is user password',
                role: 'staff',
                branchId: branches.IT._id,
            },
        ],
        student: [
            {
                email: 'student-ce-1@email.com',
                name: 'student-ce-1',
                password: 'This is user password',
                role: 'student',
                branchId: branches.CE._id,
                batch: branches.CE.batch,
                branchName: branches.CE.name,
                phone: '1234567890',
            },
            {
                email: 'student-it-1@email.com',
                name: 'student-it-1',
                password: 'This is user password',
                role: 'student',
                branchId: branches.IT._id,
                batch: branches.IT.batch,
                branchName: branches.IT.name,
                phone: '1234567890',
            },
        ],
    };

    describe('createNewUser', () => {
        const studentDto: CreateUserDTO = {
            email: 'test-user@email.com',
            name: 'Test User',
            password: 'password123',
            role: 'student',
            branchId: branches.CE._id,
            currentSemester: 7,
            phone: '1234567890',
        };

        it('should throw ForbiddenException when authedUser does not have permission to create the given role', async () => {
            // Mocking the permission check to return false
            accessControlService.checkAccessPermission.mockReturnValue(false);

            await expect(usersService.createNewUser(authedUser.staff[0], studentDto)).rejects.toThrow(ForbiddenException);

            expect(accessControlService.checkAccessPermission).toHaveBeenCalledWith('staff', OPERATIONS.CREATE, 'student');
        });

        it('should assign branch details to students and create users', async () => {
            // permission mocking
            accessControlService.checkAccessPermission.mockReturnValue(true);
            // find branch by id mock
            branchRepository.findBranchById.mockResolvedValue(branches.CE);
            userRepository.findTotalNumberOfStudentsInABranch.mockResolvedValue(0);
            userRepository.createUser.mockResolvedValue({ ...studentDto });

            const result = await usersService.createNewUser(authedUser.staff[0], studentDto);

            expect(result).toBeDefined();
            expect(branchRepository.findBranchById).toHaveBeenCalledWith(branches.CE._id.toString());
            expect(userRepository.findTotalNumberOfStudentsInABranch).toHaveBeenCalledWith(branches.CE._id);
            expect(userRepository.createUser).toHaveBeenCalledWith({
                ...studentDto,
                branchName: branches.CE.name,
                batch: branches.CE.batch,
            });
        });

        it('should throw an error if branch is not found when creating a non-admin user', async () => {
            branchRepository.findBranchById.mockResolvedValue(null);
            accessControlService.checkAccessPermission.mockReturnValue(true);

            await expect(usersService.createNewUser(authedUser.admin[0], studentDto)).rejects.toThrow(HttpException);

            expect(branchRepository.findBranchById).toHaveBeenCalledWith(studentDto.branchId.toString());
        });

        it('should throw an error when student count exceeds the total intake of the branch', async () => {
            const branchDetails = branches.CE;
            accessControlService.checkAccessPermission.mockReturnValue(true);
            branchRepository.findBranchById.mockResolvedValue(branchDetails);
            userRepository.findTotalNumberOfStudentsInABranch.mockResolvedValue(branchDetails.totalStudentsIntake);

            await expect(usersService.createNewUser(authedUser.staff[0], studentDto)).rejects.toThrow(HttpException);

            expect(userRepository.findTotalNumberOfStudentsInABranch).toHaveBeenCalledWith(branchDetails._id);
            expect(branchRepository.findBranchById).toHaveBeenCalledWith(branchDetails._id.toString());
        });
    });

    describe('getUsers', () => {
        it('should return users matching the search criteria', async () => {
            const authedUserRole: RoleType = 'admin'; // Admin has access to all users
            const query: GetUsersQueryDTO = { matchingBy: 'student', sortBy: 'name', order: 'asce', limit: '10', skip: '0' };

            // Mock the access control to return all roles
            accessControlService.checkAccessPermission.mockReturnValue({ student: true, staff: true });

            // Mock userRepository.getUsers to return matching users
            userRepository.getUsers.mockResolvedValue(authedUser.student);

            const result = await usersService.getUsers(authedUserRole, query);

            expect(result).toEqual(authedUser.student);
            expect(userRepository.getUsers).toHaveBeenCalledWith(
                {
                    role: { $in: ['student', 'staff'] },
                    $or: [{ name: new RegExp(query.matchingBy as string, 'i') }, { email: new RegExp(query.matchingBy as string, 'i') }],
                },
                { name: 1 },
                10,
                0,
            );
        });

        it('should throw a ForbiddenException if authedUser does not have permission to access users', async () => {
            const authedUserRole: RoleType = 'staff'; // Assuming 'staff' cannot access 'analysis'
            const query: GetUsersQueryDTO = { matchingBy: '', sortBy: 'name', order: 'asce', limit: '10', skip: '0' };

            // Mock the access control check to return null (no access)
            accessControlService.checkAccessPermission.mockReturnValue(null);

            await expect(usersService.getUsers(authedUserRole, query)).rejects.toThrow(HttpException);
            expect(accessControlService.checkAccessPermission).toHaveBeenCalledWith(authedUserRole, 'read', 'analysis');
        });
    });

    describe('getUserById', () => {
        it('should return the authedUser if they are requesting their own data and have access permission', async () => {
            // Mock the access control service to return true (permission allowed)
            accessControlService.checkAccessPermission.mockReturnValue(true);
            const authedUserDocument: UserDocument = { ...authedUser.admin[0], _id: getObjectID() } as unknown as UserDocument;
            const result = await usersService.getUserById(authedUserDocument, authedUserDocument._id.toString());

            expect(result).toEqual(authedUserDocument);
            expect(accessControlService.checkAccessPermission).toHaveBeenCalledWith(authedUserDocument.role, OPERATIONS.READ, RESOURCE.SELF);
        });

        it('should throw a ForbiddenException if authedUser tries to access data of another user with the same role', async () => {
            const authedUserDocument: UserDocument = { ...authedUser.staff[0], _id: getObjectID() } as UserDocument;
            const requestedUserDocument: UserDocument = { ...authedUser.staff[1], _id: getObjectID() } as UserDocument;
            const id = requestedUserDocument._id.toString();

            // Mock the userRepository to return the requested user
            userRepository.findUserById.mockResolvedValue(requestedUserDocument);

            await expect(usersService.getUserById(authedUserDocument, id)).rejects.toThrow(HttpException);
            expect(userRepository.findUserById).toHaveBeenCalledWith(id);
        });

        it('should return the requested user if authedUser has the correct permission to access the data', async () => {
            const authedUserDocument: UserDocument = { ...authedUser.admin[0], _id: getObjectID() } as UserDocument;
            const requestedUserDocument: UserDocument = { ...authedUser.student[0], _id: getObjectID() } as UserDocument;
            const id = requestedUserDocument._id.toString();
            // Mock the access control service to return true (permission allowed)
            accessControlService.checkAccessPermission.mockReturnValue(true);

            // Mock the userRepository to return the requested user
            userRepository.findUserById.mockResolvedValue(requestedUserDocument);

            const result = await usersService.getUserById(authedUserDocument, id);

            expect(result).toEqual(requestedUserDocument);
            expect(accessControlService.checkAccessPermission).toHaveBeenCalledWith(authedUserDocument.role, OPERATIONS.READ, requestedUserDocument.role);
            expect(userRepository.findUserById).toHaveBeenCalledWith(id);
        });
    });

    describe('deleteUserWithId', () => {
        it('should throw a NotFoundException if the user is not found', async () => {
            const authedUserDocument: UserDocument = authedUser.admin[0] as UserDocument;
            const id = 'id123';
            userRepository.findUserById.mockResolvedValue(null);

            await expect(usersService.deleteUserWithId(authedUserDocument, id)).rejects.toThrow(NotFoundException);
            expect(userRepository.findUserById).toHaveBeenCalledWith(id);
        });

        it('should throw a HttpException if authedUser does not have permission to access users', async () => {
            const authedUserDocument: UserDocument = authedUser.admin[0] as UserDocument;
            const id = '123';
            accessControlService.checkAccessPermission.mockReturnValue(false);
            userRepository.findUserById.mockResolvedValue(authedUser.admin[0] as UserDocument);

            await expect(usersService.deleteUserWithId(authedUserDocument, id)).rejects.toThrow(HttpException);

            expect(userRepository.findUserById).toHaveBeenCalledWith(id);
        });

        it('should throw a HttpException if staff user is deleting other branch student', async () => {
            const authedUserDocument: UserDocument = { ...authedUser.staff[0], _id: getObjectID() } as UserDocument;
            const requestedUserDocument: UserDocument = { ...authedUser.student[1], _id: getObjectID() } as UserDocument;
            accessControlService.checkAccessPermission.mockReturnValue(true);
            userRepository.findUserById.mockResolvedValue(requestedUserDocument);

            await expect(usersService.deleteUserWithId(authedUserDocument, requestedUserDocument._id.toString())).rejects.toThrow(HttpException);

            expect(userRepository.findUserById).toHaveBeenCalledWith(requestedUserDocument._id.toString());
            expect(accessControlService.checkAccessPermission).toHaveBeenCalledWith(authedUserDocument.role, OPERATIONS.DELETE, requestedUserDocument.role);
        });
    });

    describe('updateUser', () => {
        it('should throw NotFoundException if the user is not found', async () => {
            const authedUserDocument: UserDocument = { ...authedUser.admin[0], _id: getObjectID() } as UserDocument;
            userRepository.findUserById.mockResolvedValue(null);
            const editedUser: UpdateUserDTO = authedUser.staff[0];
            await expect(usersService.updateUser(authedUserDocument, authedUserDocument._id.toString(), editedUser)).rejects.toThrow(HttpException);
            expect(userRepository.findUserById).toHaveBeenCalledWith(authedUserDocument._id.toString());
        });

        it('should throw HttpException when authedUser does not have permission to update user data', async () => {
            const authedUserDocument: UserDocument = authedUser.staff[0] as UserDocument;
            const id = '123';
            const editedUser: UpdateUserDTO = authedUserDocument;
            const requestedUser: User = authedUser.staff[0];

            // Mock repository calls
            userRepository.findUserById.mockResolvedValue(requestedUser as UserDocument);

            // Mock the access control to return false (no permission)
            accessControlService.checkAccessPermission.mockResolvedValue(false);

            // Test the function and expect a ForbiddenException
            await expect(usersService.updateUser(authedUserDocument, id, editedUser)).rejects.toThrow(HttpException);
        });

        it('should throw HttpException if staff tries to change details of a student from another branch', async () => {
            const authedUserDocument: UserDocument = { ...authedUser.staff[0] } as UserDocument;
            const id = '123';
            const editedUser: UpdateUserDTO = { ...authedUser.student[1], name: 'edited name' };
            const requestedUser: User = editedUser as User;

            // Mock repository calls
            userRepository.findUserById.mockResolvedValue(requestedUser as UserDocument);

            // Mock the access control to allow permission for the operation
            accessControlService.checkAccessPermission.mockResolvedValue(true);

            // Test the function and expect a ForbiddenException
            await expect(usersService.updateUser(authedUserDocument, id, editedUser)).rejects.toThrow(HttpException);
        });

        it('should successfully update the user', async () => {
            const authedUserDocument: UserDocument = authedUser.admin[0] as UserDocument;
            const id = '123';
            const editedUser: UpdateUserDTO = { ...authedUser.staff[0], name: 'Edited user name' };
            const requestedUser: User = authedUser.staff[0];
            const updatedUser: User = { ...requestedUser, ...editedUser };

            // Mock repository calls
            userRepository.findUserById.mockResolvedValue(requestedUser as UserDocument);
            userRepository.updatedUser.mockResolvedValue(updatedUser);

            // Mock access control to allow permission and no forbidden fields
            accessControlService.checkAccessPermission.mockResolvedValue([]);

            // Mock branch repository to find branch
            branchRepository.findBranchById.mockResolvedValue(branches.CE);

            // Test the function and expect the updated user
            const result = await usersService.updateUser(authedUserDocument, id, editedUser);

            // Verify the expected outcome
            expect(result).toEqual(updatedUser);
            expect(userRepository.updatedUser).toHaveBeenCalledWith(requestedUser, editedUser);
        });
    });

    describe('batchAnalysis', () => {
        it('should return batch-wise analysis', async () => {
            const mockBatchAnalysis = [];

            // Mock the repository call
            userRepository.getBatchWiseAnalysis.mockResolvedValue(mockBatchAnalysis);

            // Call the service function
            const result = await usersService.batchAnalysis();

            // Validate the behavior and result
            expect(userRepository.getBatchWiseAnalysis).toHaveBeenCalled();
            expect(result).toEqual(mockBatchAnalysis);
        });
    });
    describe('vacantAnalysis', () => {
        it('should return vacant analysis for a specific batch and branch', async () => {
            const mockVacantAnalysis = [];
            const query: VacantSeatQueryDTO = {
                batch: 2022,
                branchName: 'CE',
            };

            // Mock the repository call
            userRepository.getVacantAnalysis.mockResolvedValue(mockVacantAnalysis);

            // Call the service function with the arguments
            const result = await usersService.vacantAnalysis(query);

            // Validate the behavior and result
            expect(userRepository.getVacantAnalysis).toHaveBeenCalledWith(query);
            expect(result).toEqual(mockVacantAnalysis);
        });
    });
});
