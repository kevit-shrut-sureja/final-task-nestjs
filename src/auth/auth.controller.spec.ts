import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserRepository } from '../users/users.repository';
import { AuthGuard } from './auth.guard';
import { mock } from 'jest-mock-extended';
import { UserDocument } from '../users/users.schema';
import { AuthedUserType } from '../types';

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

    describe('loginUser', () => {
        const mockCredentials = { email: 'test@email.com', password: 'password' };
        const mockTokenResult = { token: 'mockToken' };

        it('should return the result from validateUser when login is successful', async () => {
            service.validateUser.mockResolvedValue(mockTokenResult);

            const result = await controller.loginUser(mockCredentials);

            expect(service.validateUser).toHaveBeenCalledWith(mockCredentials);
            expect(result).toEqual(mockTokenResult);
        });

        it('should handle errors thrown by validateUser', async () => {
            service.validateUser.mockRejectedValue(new Error('Unexpected error'));

            await expect(controller.loginUser(mockCredentials)).rejects.toThrow(Error);
        });
    });

    describe('logoutUser', () => {
        const mockUser = { id: 'userId', email: 'test@email.com', role: 'user', tokens: [] } as unknown as UserDocument;
        const mockReq = { token: 'mockToken' } as unknown as AuthedUserType<UserDocument>;
        const mockAll = false;

        it('should call logoutUser on the service and return success', async () => {
            service.logoutUser.mockResolvedValue({ message: 'success' });

            const result = await controller.logoutUser(mockUser, mockAll, mockReq);

            expect(service.logoutUser).toHaveBeenCalledWith(mockUser, mockAll, mockReq.token);
            expect(result.message).toBe('success');
        });

        it('should handle errors thrown by logoutUser', async () => {
            service.logoutUser.mockRejectedValue(new Error('Logout error'));
            await expect(controller.logoutUser(mockUser, mockAll, mockReq)).rejects.toThrow(Error);
        });
    });
});
