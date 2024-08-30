import { ForbiddenException, forwardRef, HttpException, Inject, Injectable } from '@nestjs/common';
import { CreateUserDTO } from './dtos/create-user.dto';
import { UserRepository } from './users.repository';
import { User, UserDocument } from './users.schema';
import { OPERATIONS, ROLE, RoleType } from 'src/constants/role.constants';
import { AccessControlService } from 'src/access-control/access-control.service';
import { BranchRepository } from 'src/branch/branch.repository';

@Injectable()
export class UsersService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly accessControlService: AccessControlService,
        private  readonly branchRepository : BranchRepository
    ) {}

    async createNewUser(authedUser: User, createUserDto: CreateUserDTO): Promise<User> {
        const roleToBeCreated = createUserDto.role;
        const authedUserRole = authedUser.role
        // check permission's level
        if (!this.accessControlService.checkAccessPermission(authedUserRole, OPERATIONS.CREATE, roleToBeCreated)) {
            throw new ForbiddenException('Forbidden from access.');
        }

        // staff can only add data of the student in their branch
        const branchId = createUserDto?.branchId;
        const authedUserBranchId = authedUser?.branchId
        if (branchId && authedUserRole === ROLE.STAFF && authedUserBranchId.toString() !== branchId) {
            throw new HttpException('Staff user cannot change details of other staff user', 403)
        }

        // if branch does not exist then this throws error 
        const branch = await this.branchRepository.findBranchById(branchId)

        // If new user is student then adding data from the branch details
        if (roleToBeCreated === ROLE.STUDENT) {
            createUserDto.batch = branch.batch;
            createUserDto.branchName = branch.name;
        }

        // check if the totalStudentsIntake is less or not
        const studentCount = await this.userRepository.findTotalNumberOfStudentsInABranch(branchId);
        if (studentCount + 1 > branch.totalStudentsIntake) {
            throw new HttpException('Total students count exceeding.', 404)
        }

        return await this.userRepository.createUser(createUserDto);
    }
}
