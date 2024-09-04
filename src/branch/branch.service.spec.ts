import { mock } from 'jest-mock-extended';
import { UserRepository } from '../users/users.repository';
import { BranchRepository } from './branch.repository';
import { BranchService } from './branch.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Branch, BranchDocument } from './branch.schema';
import { getObjectID } from '../utils/helper-functions';

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
            const branch: BranchDocument = {
                _id: getObjectID('66d4b489c71294301d3a1882'),
                name: 'CE',
                batch: 2021,
                totalStudentsIntake: 5,
                createdAt: new Date(),
                updatedAt: new Date(),
                __v: 0,
            } as unknown as BranchDocument;

            branchRepository.findBranchById.mockResolvedValue(branch);

            const result = await branchService.findBranchById(branch._id.toString());

            expect(result).toBeDefined();
            expect(result).toEqual(branch);
            expect(branchRepository.findBranchById).toHaveBeenCalledWith(branch._id.toString());
        });

        it('should throw an error if branch not found', async () => {
            branchRepository.findBranchById.mockResolvedValue(null);

            await expect(branchService.findBranchById('66d4b489c71294301d3a1882')).rejects.toThrow('Branch not found.');
            expect(branchRepository.findBranchById).toHaveBeenCalledWith('66d4b489c71294301d3a1882');
        });
    });

    describe.skip('findBranch', () => {});
    describe.skip('deleteBranch', () => {});
    describe.skip('updateBranch', () => {});

});
