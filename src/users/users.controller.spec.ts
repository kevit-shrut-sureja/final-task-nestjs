import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { mock } from 'jest-mock-extended';
import { AuthGuard } from '../auth/auth.guard';
import { AccessControlGuard } from '../access-control/access-control.guard';

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
        service = module.get<UsersService, jest.Mocked<UsersService>>(UsersService)
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
