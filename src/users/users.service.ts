import { ForbiddenException, forwardRef, HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDTO } from './dtos/create-user.dto';
import { UserRepository } from './users.repository';
import { User, UserDocument } from './users.schema';
import { OPERATIONS, RESOURCE, ROLE, RoleType } from 'src/constants/role.constants';
import { AccessControlService } from 'src/access-control/access-control.service';
import { BranchRepository } from 'src/branch/branch.repository';
import { GetUsersQueryDto } from './dtos/get-user-query.dto';
import { UpdateUserDTO } from './dtos/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly accessControlService: AccessControlService,
        private readonly branchRepository: BranchRepository,
    ) {}

    async createNewUser(authedUser: User, createUserDto: CreateUserDTO): Promise<User> {
        const roleToBeCreated = createUserDto.role;
        const authedUserRole = authedUser.role;
        // check permission's level
        if (!this.accessControlService.checkAccessPermission(authedUserRole, OPERATIONS.CREATE, roleToBeCreated)) {
            throw new ForbiddenException('Forbidden from access.');
        }

        if (roleToBeCreated !== ROLE.ADMIN) {
            // staff can only add data of the student in their branch
            const branchId = createUserDto?.branchId;
            const authedUserBranchId = authedUser?.branchId;
            if (branchId && authedUserRole === ROLE.STAFF && authedUserBranchId.toString() !== branchId.toString()) {
                throw new HttpException('Staff user cannot change details of other staff user', HttpStatus.FORBIDDEN);
            }

            // if branch does not exist then this throws error
            const branch = await this.branchRepository.findBranchById(branchId.toString());
            if (!branch) {
                throw new HttpException('Branch not found.', HttpStatus.NOT_FOUND);
            }

            // If new user is student then adding data from the branch details
            if (roleToBeCreated === ROLE.STUDENT) {
                createUserDto.batch = branch.batch;
                createUserDto.branchName = branch.name;
            }

            // check if the totalStudentsIntake is less or not
            const studentCount = await this.userRepository.findTotalNumberOfStudentsInABranch(branchId.toString());
            if (studentCount + 1 > branch.totalStudentsIntake) {
                throw new HttpException('Total students count exceeding.', HttpStatus.NOT_FOUND);
            }
        }

        return await this.userRepository.createUser(createUserDto);
    }

    async getUsers(authedUserRole: RoleType, query: GetUsersQueryDto): Promise<User[]> {
        const { matchingBy, sortBy, order, limit, skip } = query;

        // check the access level
        const accessLevel = this.accessControlService.checkAccessPermission(authedUserRole, 'read', 'analysis');
        if (!accessLevel) {
            throw new HttpException('This resource is not allowed for your role.', HttpStatus.FORBIDDEN);
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

    async getUserById(authedUser: UserDocument, id: string): Promise<User> {
        // for users self data
        if (authedUser.id === id) {
            if (!this.accessControlService.checkAccessPermission(authedUser.role, OPERATIONS.READ, RESOURCE.SELF)) {
                throw new HttpException('This resource is not allowed for your role.', HttpStatus.FORBIDDEN);
            }
            return authedUser;
        }

        // Fetching requested User Data
        const requestedUser = await this.userRepository.findUserById(id);
        if (!requestedUser) {
            throw new NotFoundException('User not found');
        }

        // Other user cannot fetch data of other users with same role
        if (
            (authedUser.id !== id && authedUser.role === requestedUser.role) ||
            !this.accessControlService.checkAccessPermission(authedUser.role, OPERATIONS.READ, requestedUser.role)
        ) {
            throw new HttpException('This resource is not allowed for your role.', HttpStatus.FORBIDDEN);
        }

        return requestedUser;
    }

    async deleteUserWithId(authedUser: UserDocument, id: string): Promise<User> {
        // Fetching requested User Data
        const requestedUser = await this.userRepository.findUserById(id);
        if (!requestedUser) {
            throw new NotFoundException('User not found');
        }

        // Checking permission level
        if (!this.accessControlService.checkAccessPermission(authedUser.role, OPERATIONS.DELETE, requestedUser.role)) {
            throw new HttpException('This resource is not allowed for your role.', HttpStatus.FORBIDDEN);
        }

        // staff cannot delete student from another branch
        if (authedUser.role === ROLE.STAFF) {
            const authedUserBranchId = authedUser.branchId.toString();
            const userBranchId = requestedUser.branchId.toString();
            if (authedUserBranchId !== userBranchId) {
                throw new HttpException('Staff user cannot delete students from other branchs.', HttpStatus.FORBIDDEN);
            }
        }

        // delete user
        await this.userRepository.deleteUserById(id);

        return requestedUser;
    }

    async updateUser(authedUser: UserDocument, id: string, editedUser: UpdateUserDTO) : Promise<User> {
        // Fetching requested User Data
        const requestedUser = await this.userRepository.findUserById(id);
        if (!requestedUser) {
            throw new NotFoundException('User not found');
        }

        // check permission level
        if (!this.accessControlService.checkAccessPermission(authedUser.role, OPERATIONS.UPDATE, id === authedUser.id ? RESOURCE.SELF : requestedUser.role)) {
            throw new HttpException('This resource is not allowed for your role.', HttpStatus.FORBIDDEN);
        }

        // staff cannot change details of student from another branch
        if (authedUser.role === ROLE.STAFF) {
            const authedUserBranchId = authedUser.branchId.toString();
            const userBranchId = requestedUser.branchId.toString();
            if (authedUserBranchId !== userBranchId) {
                throw new HttpException('Staff can only change the data of the students in their branch.', HttpStatus.FORBIDDEN);
            }
        }

        const notAllowedFields: string[] = this.accessControlService.checkAccessPermission(
            authedUser.role,
            OPERATIONS.UPDATE,
            authedUser.id === id ? RESOURCE.SELF_NOT_ALLOWED_FIELDS : RESOURCE.NOT_ALLOWED_FIELDS,
        );

        // this is used so that we should not all some fields to edit so if the user sends this details then forbiden error
        // now that same detail has to be added in the updatedUsers object so that it does not
        let onlyAllowedFields = true;

        for (let j = 0; j < notAllowedFields?.length; j += 1) {
            const field = notAllowedFields[j];
            const keys = field.split('.');
            let currentUser = editedUser;
            let currentRequestUser = requestedUser;

            for (let i = 0; i < keys.length; i += 1) {
                const key = keys[i];

                if (i === keys.length - 1 && currentUser && Object.prototype.hasOwnProperty.call(currentUser, key)) {
                    onlyAllowedFields = false;
                    break;
                }

                if (i === keys.length - 1) {
                    // creates a new copy
                    currentUser[key] = currentRequestUser[key];
                }

                if (!currentUser[key]) {
                    currentUser[key] = {};
                }

                // if it does not exists then it creates a empy object
                currentUser = currentUser[key];
                currentRequestUser = currentRequestUser[key];
            }
        }

        if (!onlyAllowedFields) {
            throw new HttpException('User does not have access level to edit some of the input fields.', HttpStatus.FORBIDDEN);
        }

        const branchId = editedUser.branchId;
        if (requestedUser.role !== ROLE.ADMIN && branchId && editedUser.branchId) {
            const branchExists = await this.branchRepository.findBranchById(editedUser.branchId.toString());
            if (!branchExists) {
                throw new HttpException('Branch not found.', HttpStatus.NOT_FOUND);
            }

            if (requestedUser.role === ROLE.STUDENT) {
                editedUser.batch = branchExists.batch;
                editedUser.branchName = branchExists.name;
            }
        }

        const updatedUser = await this.userRepository.updatedUser(requestedUser, editedUser)
        return updatedUser
    }

    async batchAnalysis(){
        return await this.userRepository.getBatchWiseAnalysis()
    }
}
