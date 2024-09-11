import { Test, TestingModule } from '@nestjs/testing';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BranchRepository } from './branch.repository';
import { UserRepository } from '../users/users.repository';
import { AuthGuard } from '../auth/auth.guard';
import { AccessControlGuard } from '../access-control/access-control.guard';
import { mock } from 'jest-mock-extended';
import { Branch } from './branch.schema';
import { CreateBranchDTO, GetBranchQueryDTO, UpdateBranchDTO } from './dtos';

const mockAuthGuard = {
    canActivate: jest.fn(() => true),
};

const mockAccessControlGuard = {
    canActivate: jest.fn(() => true),
};

describe('BranchController', () => {
    let controller: BranchController;
    let service: jest.Mocked<BranchService>;

    beforeEach(async () => {
        const mockBranchService = mock<BranchService>();
        const module: TestingModule = await Test.createTestingModule({
            controllers: [BranchController],
            providers: [
                { provide: BranchService, useValue: mockBranchService },
                {
                    provide: getRepositoryToken(BranchRepository),
                    useValue: {},
                },
                {
                    provide: getRepositoryToken(UserRepository),
                    useValue: {},
                },
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue(mockAuthGuard)
            .overrideGuard(AccessControlGuard)
            .useValue(mockAccessControlGuard)
            .compile();

        controller = module.get<BranchController>(BranchController);
        service = module.get<BranchService, jest.Mocked<BranchService>>(BranchService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    const createBranchDto: CreateBranchDTO = { name: 'New Branch', batch: 2022, totalStudentsIntake: 3 };
    const expectedResult: Branch = { name: 'New Branch', batch: 2022, totalStudentsIntake: 3 };

    describe('createNewBranch', () => {
        it('should create a new branch successfully', async () => {
            service.createNewBranch.mockResolvedValue(expectedResult);

            const result = await controller.createNewBranch(createBranchDto);

            expect(result).toEqual(expectedResult);
            expect(service.createNewBranch).toHaveBeenCalledWith(createBranchDto);
        });
    });

    describe('getBranchWithId', () => {
        it('should return branch by id', async () => {
            const branchId = 'this is branchid';
            service.findBranchById.mockResolvedValue(expectedResult);

            const result = await controller.getBranchWithId(branchId);

            expect(result).toEqual(expectedResult);
            expect(service.findBranchById).toHaveBeenCalledWith(branchId);
        });
    });

    describe('getBranch', () => {
        it('should return list of branches based on query', async () => {
            const query: GetBranchQueryDTO = { order: 'asce', skip: 0 };
            const expectedBranches = [expectedResult];

            service.findBranch.mockResolvedValue(expectedBranches); // Mock service method

            const result = await controller.getBranch(query);

            expect(result).toEqual(expectedBranches);
            expect(service.findBranch).toHaveBeenCalledWith(query);
        });
    });

    describe('deleteBranch', () => {
        it('should delete a branch by id', async () => {
            const branchId = 'branchId';

            service.deleteBranch.mockResolvedValue(expectedResult); // Mock service method

            const result = await controller.deleteBranch(branchId);

            expect(result).toEqual(expectedResult);
            expect(service.deleteBranch).toHaveBeenCalledWith(branchId);
        });
    });

    describe('updateBranch', () => {
        it('should update a branch by id', async () => {
            const branchId = 'branchId';
            const updateBranchDto : UpdateBranchDTO = { name: 'Updated Branch' };

            service.updateBranch.mockResolvedValue(expectedResult); // Mock service method

            const result = await controller.updateBranch(branchId, updateBranchDto);

            expect(result).toEqual(expectedResult);
            expect(service.updateBranch).toHaveBeenCalledWith(branchId, updateBranchDto);
        });
    });
});
