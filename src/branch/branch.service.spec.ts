import { mock } from 'jest-mock-extended';
import { UserRepository } from '../users/users.repository';
import { BranchRepository } from './branch.repository';
import { BranchService } from './branch.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('BranchService', () => {
    let branchService: BranchService;
    let branchRepository: jest.Mocked<BranchRepository>;
    let userRepository: jest.Mocked<UserRepository>;

    beforeEach(async () => {
        const mockBranchRepository = mock<BranchRepository>();
        const mockUserRepository = mock<UserRepository>();

        const module: TestingModule = await Test.createTestingModule({
            providers : [
                BranchService,
                {
                    provide : UserRepository,
                    useValue: mockUserRepository
                },
                {
                    provide : BranchRepository, 
                    useValue : mockBranchRepository
                }
            ]
        })
        .compile()

        branchService = module.get<BranchService>(BranchService);
        branchRepository = module.get<BranchRepository, jest.Mocked<BranchRepository>>(BranchRepository)
        userRepository = module.get<UserRepository, jest.Mocked<UserRepository>>(UserRepository)
    });

    it('should be defined', () => {
        expect(branchService).toBeDefined()
        expect(branchRepository).toBeDefined()
        expect(userRepository).toBeDefined()
    })

    describe.skip('createNewBranch', () => {});
    describe.skip('findBranchById', () => {});
    describe.skip('findBranch', () => {});
    describe.skip('deleteBranch', () => {});
    describe.skip('updateBranch', () => {});

});
