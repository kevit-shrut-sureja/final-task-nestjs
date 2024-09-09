import { mock } from 'jest-mock-extended';
import { UserRepository } from '../users/users.repository';
import { BranchRepository } from './branch.repository';
import { BranchService } from './branch.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Branch, BranchDocument } from './branch.schema';
import { getObjectID } from '../utils/helper-functions';
import { GetBranchQueryDTO } from './dtos';
import { User } from '../users/users.schema';
import { ROLE } from '../constants';
import { HttpException } from '@nestjs/common';

describe('BranchService', () => {
    let branchService: BranchService;
    let branchRepository: jest.Mocked<BranchRepository>;
    let userRepository: jest.Mocked<UserRepository>;

    beforeEach(async () => {
        const mockBranchRepository = mock<BranchRepository>();
        const mockUserRepository = mock<UserRepository>();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BranchService,
                {
                    provide: UserRepository,
                    useValue: mockUserRepository,
                },
                {
                    provide: BranchRepository,
                    useValue: mockBranchRepository,
                },
            ],
        }).compile();

        branchService = module.get<BranchService>(BranchService);
        branchRepository = module.get<BranchRepository, jest.Mocked<BranchRepository>>(BranchRepository);
        userRepository = module.get<UserRepository, jest.Mocked<UserRepository>>(UserRepository);
    });

    it('should be defined', () => {
        expect(branchService).toBeDefined();
        expect(branchRepository).toBeDefined();
        expect(userRepository).toBeDefined();
    });

    // dummy branch
    const dummyBranchDocument: BranchDocument = {
        _id: getObjectID('66d4b489c71294301d3a1882'),
        name: 'CE',
        batch: 2021,
        totalStudentsIntake: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0,
    } as unknown as BranchDocument;

    const dummyBranchDocumentId = dummyBranchDocument._id.toHexString();
    // dummy users
    const dummyUsers: User[] = [
        {
            email: 'staff@email.com',
            name: 'Staff',
            password: '------------',
            role: ROLE.STAFF,
            branchId: getObjectID('66d4b489c71294301d3a1882'),
        },
        {
            email: 'staff@email.com',
            name: 'Staff',
            password: '------------',
            role: ROLE.STAFF,
            branchId: getObjectID('66d4b489c71294301d3a1882'),
        },
    ];

    describe('createNewBranch', () => {
        const branch: Branch = {
            batch: 2024,
            name: 'CE',
            totalStudentsIntake: 5,
        };
        it('should create a new branch', async () => {
            branchRepository.createBranch.mockResolvedValue(branch);

            const result = await branchService.createNewBranch(branch);

            expect(result).toBeDefined();
            expect(branchRepository.createBranch).toHaveBeenCalledWith(branch);
        });

        it('should throw error if branch exist', async () => {
            branchRepository.createBranch.mockRejectedValue(new Error('Throw a error'));
            await expect(branchService.createNewBranch(branch)).rejects.toThrow('Throw a error');
            expect(branchRepository.createBranch).toHaveBeenCalledWith(branch);
        });
    });

    describe('findBranchById', () => {
        it('should find a branch by id', async () => {
            branchRepository.findBranchById.mockResolvedValue(dummyBranchDocument);

            const result = await branchService.findBranchById(dummyBranchDocumentId);

            expect(result).toBeDefined();
            expect(result).toEqual(dummyBranchDocument);
            expect(branchRepository.findBranchById).toHaveBeenCalledWith(dummyBranchDocumentId);
        });

        it('should throw an error if branch not found', async () => {
            branchRepository.findBranchById.mockResolvedValue(null);

            await expect(branchService.findBranchById(dummyBranchDocumentId)).rejects.toThrow('Branch not found.');
            expect(branchRepository.findBranchById).toHaveBeenCalledWith(dummyBranchDocumentId);
        });
    });

    describe('findBranch', () => {
        const branchQueryDto: GetBranchQueryDTO = {
            limit: 10,
            matchBy: 'CE',
            order: 'desc',
            skip: 0,
            sortBy: 'name',
        };

        it('should return branches', async () => {
            const branch: Branch[] = [
                {
                    name: 'CE',
                    batch: 2021,
                    totalStudentsIntake: 5,
                },
                {
                    name: 'CE',
                    batch: 2021,
                    totalStudentsIntake: 5,
                },
            ];
            branchRepository.findBranch.mockResolvedValue(branch);
            const result = await branchService.findBranch(branchQueryDto);

            expect(result).toBeDefined();
            expect(branchRepository.findBranch).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if branch not found', async () => {
            branchRepository.findBranch.mockRejectedValue(new Error('An error is thrown'));

            await expect(branchService.findBranch(branchQueryDto)).rejects.toThrow('An error is thrown');
            expect(branchRepository.findBranch).toHaveBeenCalledTimes(1);
        });
    });

    describe('deleteBranch', () => {
        it('Should delete a branch if no users', async () => {
            // mocking the fucntions
            userRepository.findUsersByBranchId.mockResolvedValue([]);
            branchRepository.deleteUserBranch.mockResolvedValue(dummyBranchDocument);

            const result = await branchService.deleteBranch(dummyBranchDocumentId);

            expect(result).toBeDefined();
            expect(userRepository.findUsersByBranchId).toHaveBeenCalledWith(dummyBranchDocumentId);
            expect(branchRepository.deleteUserBranch).toHaveBeenCalledWith(dummyBranchDocumentId);
        });

        it('Should not delete a branch if users with that branch exists', async () => {
            // mocking the fucntions
            userRepository.findUsersByBranchId.mockResolvedValue(dummyUsers);
            branchRepository.deleteUserBranch.mockResolvedValue(dummyBranchDocument);

            await expect(branchService.deleteBranch(dummyBranchDocumentId)).rejects.toThrow('Users exists with this branch id so cannot delete branch.');

            expect(userRepository.findUsersByBranchId).toHaveBeenCalledWith(dummyBranchDocumentId);
            expect(userRepository.findUsersByBranchId).toHaveBeenCalledTimes(1);
            expect(branchRepository.deleteUserBranch).toHaveBeenCalledTimes(0);
        });

        it('Should not delete a branch that does not exists', async () => {
            // mocking the fucntions
            userRepository.findUsersByBranchId.mockResolvedValue([]);
            branchRepository.deleteUserBranch.mockResolvedValue(null);

            await expect(branchService.deleteBranch(dummyBranchDocumentId)).rejects.toThrow('Branch not found.');

            expect(userRepository.findUsersByBranchId).toHaveBeenCalledWith(dummyBranchDocumentId);
            expect(branchRepository.deleteUserBranch).toHaveBeenCalledWith(dummyBranchDocumentId);
        });
    });

    describe('updateBranch', () => {
        it('should throw 404 error if branch is not found', async () => {
            branchRepository.findBranchById.mockResolvedValue(null);

            await expect(branchService.updateBranch(dummyBranchDocumentId, { name: 'Updated Name', batch: 2022 })).rejects.toThrow(HttpException);

            expect(branchRepository.findBranchById).toHaveBeenCalledWith(dummyBranchDocumentId);
            expect(branchRepository.findBranchById).toHaveBeenCalledTimes(1);
        });

        it('should throw 409 error if users exist and batch or name is being updated', async () => {
            branchRepository.findBranchById.mockResolvedValue(dummyBranchDocument);
            userRepository.findUsersByBranchId.mockResolvedValue(dummyUsers);

            await expect(branchService.updateBranch(dummyBranchDocumentId, { name: 'Updated Name', batch: 2022 })).rejects.toThrow(
                'Users exists with this branch id so cannot update batch or name.',
            );

            expect(branchRepository.findBranchById).toHaveBeenCalledWith(dummyBranchDocument._id.toHexString());
            expect(userRepository.findUsersByBranchId).toHaveBeenCalledWith(dummyBranchDocument._id.toHexString());
        });

        it('should throw 409 error if total students intake is less than the current number of students', async () => {
            branchRepository.findBranchById.mockResolvedValue(dummyBranchDocument);
            userRepository.findUsersByBranchId.mockResolvedValue([]);
            userRepository.findTotalNumberOfStudentsInABranch.mockResolvedValue(6); // More than the new intake

            await expect(branchService.updateBranch(dummyBranchDocumentId, { totalStudentsIntake: 4 })).rejects.toThrow(
                'Current number of total students are more than updated number of total students intake.',
            );

            expect(branchRepository.findBranchById).toHaveBeenCalledWith(dummyBranchDocumentId);
            expect(userRepository.findTotalNumberOfStudentsInABranch).toHaveBeenCalledWith(getObjectID(dummyBranchDocumentId));
        });

        it('should update the branch successfully', async () => {
            const updatedBranch: Branch = { ...dummyBranchDocument, name: 'Updated Name', batch: 2022 };
            branchRepository.findBranchById.mockResolvedValue(dummyBranchDocument);
            userRepository.findUsersByBranchId.mockResolvedValue([]);
            userRepository.findTotalNumberOfStudentsInABranch.mockResolvedValue(4); // Less than or equal to new intake
            branchRepository.updateBranch.mockResolvedValue(updatedBranch);

            const result = await branchService.updateBranch(dummyBranchDocumentId, {
                name: 'Updated Name',
                batch: 2022,
            });

            expect(result).toEqual(updatedBranch);
            expect(branchRepository.updateBranch).toHaveBeenCalledWith(dummyBranchDocument, {
                name: 'Updated Name',
                batch: 2022,
            });
        });
    });
});
