import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserRepository } from '../users/users.repository';
import { mock } from 'jest-mock-extended';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
    let service: AuthService;
    let userRepository: jest.Mocked<UserRepository>;

    beforeEach(async () => {
        const mockUserRepository = mock<UserRepository>()
        const module: TestingModule = await Test.createTestingModule({
            providers: [AuthService, 
                {
                    provide : UserRepository,
                    useValue : mockUserRepository
                },
                {
                    provide : JwtService,
                    useValue : {}
                }
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        userRepository = module.get<UserRepository, jest.Mocked<UserRepository>>(UserRepository)
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
