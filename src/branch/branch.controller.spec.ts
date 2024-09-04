import { Test, TestingModule } from '@nestjs/testing';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BranchRepository } from './branch.repository';
import { UserRepository } from '../users/users.repository';
import { AuthGuard } from '../auth/auth.guard';
import { AccessControlGuard } from '../access-control/access-control.guard';
import { mock } from 'jest-mock-extended';

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
});
