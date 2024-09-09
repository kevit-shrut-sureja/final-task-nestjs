import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { mock } from 'jest-mock-extended';
import { AuthGuard } from '../auth/auth.guard';
import { AccessControlGuard } from '../access-control/access-control.guard';
import { RoleType } from '../constants';
import { User, UserDocument } from './users.schema';
import { BranchDocument } from '../branch/branch.schema';
import { getObjectID } from '../utils/helper-functions';
import { GetUsersQueryDTO, UpdateUserDTO, VacantSeatQueryDTO } from './dtos';

describe('UsersController', () => {
    let controller: UsersController;
    let service: jest.Mocked<UsersService>;

    beforeEach(async () => {
        const mockUserService = mock<UsersService>();
        const mockAuthGuard = {
            canActivate: jest.fn(() => true),
        };
        const mockAccessControl = {
            canActivate: jest.fn(() => true),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                {
                    provide: UsersService,
                    useValue: mockUserService,
                },
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue(mockAuthGuard)
            .overrideGuard(AccessControlGuard)
            .useValue(mockAccessControl)
            .compile();

        controller = module.get<UsersController>(UsersController);
        service = module.get<UsersService, jest.Mocked<UsersService>>(UsersService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
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
        it('should call userService.createNewUser with the correct parameters', async () => {
            service.createNewUser.mockResolvedValue(authedUser.staff[0]); // Mock the service response

            const result = await controller.createNewUser(authedUser.admin[0], authedUser.staff[0]);

            expect(result).toEqual(authedUser.staff[0]);
            expect(service.createNewUser).toHaveBeenCalledWith(authedUser.admin[0], authedUser.staff[0]);
        });
    });

    describe('getUsers', () => {
        it('should call userService.getUsers and return data', async () => {
            const query: GetUsersQueryDTO = { limit: '10', skip: '0', matchingBy: 'student', order: 'asce', sortBy: 'name' };
            service.getUsers.mockResolvedValue(authedUser.student);

            const result = await controller.getUsers(authedUser.admin[0].role, query);

            expect(result).toEqual(authedUser.student);
            expect(service.getUsers).toHaveBeenCalledWith(authedUser.admin[0].role, query);
        });
    });

    describe('getBatchAnalysis', () => {
        it('should call userService.batchAnalysis and return analysis', async () => {
            const expectedResult = [{ batch: 'Batch 1', analysis: 'Details' }];
    
            service.batchAnalysis.mockResolvedValue(expectedResult);
    
            const result = await controller.getBatchAnalysis();
    
            expect(result).toEqual(expectedResult);
            expect(service.batchAnalysis).toHaveBeenCalled();
        });
    });

    describe('getVacantAnalysis', () => {
        it('should call userService.vacantAnalysis and return vacant seat analysis', async () => {
            const query : VacantSeatQueryDTO = { batch : 2022, branchName : "CE" };  // Mock query
            const expectedResult = [];
    
            service.vacantAnalysis.mockResolvedValue(expectedResult);
    
            const result = await controller.getVacantAnalysis(query);
    
            expect(result).toEqual(expectedResult);
            expect(service.vacantAnalysis).toHaveBeenCalledWith(query);
        }); 
    });

    describe('getUserById', () => {
        it('should call userService.getUserById and return the user', async () => {
            const authedUserDocument : UserDocument = {...authedUser.staff[0], _id : getObjectID()} as UserDocument;
            const expectedResult : UserDocument = {...authedUser.student[0], _id : getObjectID()} as UserDocument;
            const id = expectedResult._id.toString();
    
            service.getUserById.mockResolvedValue(expectedResult);
    
            const result = await controller.getUserById(authedUserDocument, id);
    
            expect(result).toEqual(expectedResult);
            expect(service.getUserById).toHaveBeenCalledWith(authedUserDocument, id);
        });
    });

    describe('deleteUser', () => {
        it('should call userService.deleteUserWithId and return the deleted user', async () => {
            const authedUserDocument : UserDocument = {...authedUser.staff[0], _id : getObjectID()} as UserDocument;
            const expectedResult : UserDocument = {...authedUser.student[0], _id : getObjectID()} as UserDocument;
            const id = expectedResult._id.toString();
    
            service.deleteUserWithId.mockResolvedValue(expectedResult);
    
            const result = await controller.deleteUser(authedUserDocument, id);
    
            expect(result).toEqual(expectedResult);
            expect(service.deleteUserWithId).toHaveBeenCalledWith(authedUserDocument, id);
        });
    });

    describe('editUser', () => {
        it('should call userService.updateUser and return the updated user', async () => {
            const authedUserDocument : UserDocument = {...authedUser.staff[0], _id : getObjectID()} as UserDocument;
            const editedUser: UpdateUserDTO = {...authedUser.student[0], name : "edited username"};
            const expectedResult = editedUser as User;
            const id = getObjectID().toString()
            service.updateUser.mockResolvedValue(expectedResult);
    
            const result = await controller.editUser(authedUserDocument, id, editedUser);
    
            expect(result).toEqual(expectedResult);
            expect(service.updateUser).toHaveBeenCalledWith(authedUserDocument, id, editedUser);
        });
    });
});
