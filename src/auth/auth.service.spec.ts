import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserRepository } from '../users/users.repository';
import { mock } from 'jest-mock-extended';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, HttpException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserDocument } from '../users/users.schema';

jest.mock('bcrypt'); // Mock bcrypt

describe('AuthService', () => {
    let authService: AuthService;
    let userRepository: jest.Mocked<UserRepository>;
    let jwtService: jest.Mocked<JwtService>;

    beforeEach(async () => {
        const mockUserRepository = mock<UserRepository>();
        const mockJwtService = mock<JwtService>();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UserRepository,
                    useValue: mockUserRepository,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        userRepository = module.get<UserRepository, jest.Mocked<UserRepository>>(UserRepository);
        jwtService = module.get<JwtService, jest.Mocked<JwtService>>(JwtService);
    });

    it('should be defined', () => {
        expect(authService).toBeDefined();
        expect(userRepository).toBeDefined();
    });

    describe('validateUser', () => {
        it('should throw 404 not found when the user does not exist', async () => {
            userRepository.findUserByEmail.mockResolvedValue(null);

            await expect(authService.validateUser({ email: 'test@test.com', password: '1234576798' })).rejects.toThrow('User not found.');

            expect(userRepository.findUserByEmail).toHaveBeenCalledWith('test@test.com');
        });

        it('should throw BadRequestException if password does not match', async () => {
            const user = { password: 'hashed-password', tokens: [] } as any;
            userRepository.findUserByEmail.mockResolvedValue(user);

            // mocking compate function from bcrypt
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(authService.validateUser({ email: 'test@test.com', password: 'entered-password' })).rejects.toThrow(BadRequestException);

            expect(userRepository.findUserByEmail).toHaveBeenCalledWith('test@test.com');
        });

        it('should return a token on successful login', async () => {
            const user = { tokens: [], save: jest.fn() } as unknown as UserDocument;
            userRepository.findUserByEmail.mockResolvedValue(user);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const token = 'thisistoken';
            jwtService.signAsync.mockResolvedValue(token);

            const result = await authService.validateUser({ email: 'test@test.com', password: 'entered password' });

            expect(result).toEqual({ token });
            expect(userRepository.findUserByEmail).toHaveBeenCalledWith('test@test.com');
            expect(userRepository.updateUserTokens).toHaveBeenCalledTimes(1);
        });

        it('should throw HttpException if an internal error occurs', async () => {
            userRepository.findUserByEmail.mockRejectedValue(HttpException);

            await expect(authService.validateUser({ email: 'test@test.com', password: '1234345' })).rejects.toThrow(HttpException);
        });
    });
    describe('logoutUser', () => {
        it('should delete all tokens', async () => {
            const user = { tokens: ['this is token'], save: jest.fn() } as unknown as UserDocument;

            const result = await authService.logoutUser(user, true, 'this is token');

            expect(result.message).toEqual('success');
            expect(userRepository.updateUserTokens).toHaveBeenCalledTimes(1);
        });

        it('should delete one tokens', async () => {
            const user = { tokens: ['this is token', 'second token'] } as unknown as UserDocument;

            const result = await authService.logoutUser(user, false, 'this is token');

            expect(result.message).toEqual('success');
            expect(userRepository.updateUserTokens).toHaveBeenCalledTimes(1);
        });

        it('should throw HttpException if an internal error occurs', async () => {
            const user = {} as unknown as UserDocument;

            await expect(authService.logoutUser(user, false, 'this is token')).rejects.toThrow(HttpException);
        });
    });
});
