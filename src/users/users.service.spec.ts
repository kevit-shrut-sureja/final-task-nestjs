import { mock } from "jest-mock-extended";
import { AccessControlService } from "../access-control/access-control.service";
import { BranchRepository } from "../branch/branch.repository";
import { UserRepository } from "./users.repository";
import { UsersService } from "./users.service"
import { Test, TestingModule } from "@nestjs/testing";

describe('UsersService', () => {
    let usersService : UsersService; 
    let userRepository : jest.Mocked<UserRepository>
    let branchRepository : jest.Mocked<BranchRepository>
    let accessControlService : jest.Mocked<AccessControlService>

    beforeEach(async () => {
        const mockUserRepository = mock<UserRepository>();
        const mockBranchRepository = mock<BranchRepository>();
        const mockAccessControlService = mock<AccessControlService>();
        
        const module : TestingModule = await Test.createTestingModule({
            providers : [
                UsersService,
                {
                    provide : UserRepository,
                    useValue : mockUserRepository
                },
                {
                    provide : BranchRepository,
                    useValue : mockBranchRepository
                },
                {
                    provide : AccessControlService,
                    useValue : mockAccessControlService
                }
            ]
        }).compile()

        usersService = module.get<UsersService>(UsersService);
        userRepository = module.get<UserRepository, jest.Mocked<UserRepository>>(UserRepository)
        branchRepository = module.get<BranchRepository, jest.Mocked<BranchRepository>>(BranchRepository)
        accessControlService = module.get<AccessControlService, jest.Mocked<AccessControlService>>(AccessControlService);
    })

    it('should be defined', () => {
        expect(usersService).toBeDefined();
        expect(userRepository).toBeDefined()
        expect(branchRepository).toBeDefined()
        expect(accessControlService).toBeDefined()
    })

    describe.skip('createNewUser', () => {});
    describe.skip('getUsers', () => {});
    describe.skip('getUserById', () => {});
    describe.skip('deleteUserWithId', () => {});
    describe.skip('updateUser', () => {});
    describe.skip('batchAnalysis', () => {});
    describe.skip('vacantAnalysis', () => {});

})