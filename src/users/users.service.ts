import { ForbiddenException, forwardRef, HttpException, Inject, Injectable } from '@nestjs/common';
import { CreateUserDTO } from './dtos/create-user.dto';
import { UserRepository } from './users.repository';
import { User } from './users.schema';
import { OPERATIONS, ROLE, RoleType } from 'src/constants/role.constants';
import { AccessControlService } from 'src/access-control/access-control.service';
import { BranchRepository } from 'src/branch/branch.repository';
import { GetUsersQueryDto } from './dtos/get-user-query.dto';

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

        if(roleToBeCreated !== ROLE.ADMIN){
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
        }

        return await this.userRepository.createUser(createUserDto);
    }

    async getUsers(authedUserRole : RoleType, query : GetUsersQueryDto, ){
        const { matchingBy, sortBy, order, limit, skip } = query;

        // check the access level
        const accessLevel = this.accessControlService.checkAccessPermission(authedUserRole, 'read', 'analysis');
        if (!accessLevel) {
            throw new HttpException('This resource is not allowed for your role.', 403)
        }

        // Build the match object for filtering users based on role and matching criteria
        const match: Record<string, any> = {};
        const usersRoleToBeShown = Object.keys(accessLevel);
        if (usersRoleToBeShown.length > 0) match.role = { $in: usersRoleToBeShown };
        
        // eslint-disable-next-line
        if (matchingBy) match['$or'] = [{ name: new RegExp(matchingBy as string, 'i') }, { email: new RegExp(matchingBy as string, 'i') }];

        const sort: Record<string, 1 | -1> = {
            [sortBy as string]: order === 'asce' ? 1 : -1,
        };

        const users = await this.userRepository.getUsers(match, sort, Number(limit), Number(skip));
        return users;
    }
}
