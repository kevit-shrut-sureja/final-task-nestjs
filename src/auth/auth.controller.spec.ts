import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserRepository } from '../users/users.repository';
import { AuthGuard } from './auth.guard';
import { mock } from 'jest-mock-extended';

const mockAuthGuard = {
    canActivate: jest.fn(() => true),
};

describe('AuthController', () => {
    let controller: AuthController;
    let service: jest.Mocked<AuthService>;

    beforeEach(async () => {
        const mockAuthService = mock<AuthService>();
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
                {
                    provide: getRepositoryToken(UserRepository),
                    useValue: {},
                },
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue(mockAuthGuard)
            .compile();

        controller = module.get<AuthController>(AuthController);
        service = module.get<AuthService, jest.Mocked<AuthService>>(AuthService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
