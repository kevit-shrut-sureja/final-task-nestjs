import { Injectable } from '@nestjs/common';
import { OPERATIONS, OperationsType, RESOURCE, ResourceType, ROLE, RoleType } from '../constants/role.constants';

@Injectable()
export class AccessControlService {
    // Roles assigned to different users
    private readonly roles = {
        [ROLE.SUPER_ADMIN]: {
            [OPERATIONS.CREATE]: {
                [RESOURCE.ADMIN]: true,
            },
            [OPERATIONS.READ]: {
                [RESOURCE.ADMIN]: true,
            },
            [OPERATIONS.UPDATE]: {
                [RESOURCE.ADMIN]: true,
            },
            [OPERATIONS.DELETE]: {
                [RESOURCE.ADMIN]: true,
            },
        },
        [ROLE.ADMIN]: {
            [OPERATIONS.CREATE]: {
                [RESOURCE.STAFF]: true,
                [RESOURCE.STUDENT]: true,
                [RESOURCE.BRANCH]: true,
                [RESOURCE.ATTENDANCE]: true,
            },
            [OPERATIONS.READ]: {
                [RESOURCE.ADMIN]: true,
                [RESOURCE.SELF]: true,
                [RESOURCE.STAFF]: true,
                [RESOURCE.STUDENT]: true,
                [RESOURCE.BRANCH]: true,
                [RESOURCE.ATTENDANCE]: true,
                [RESOURCE.ANALYSIS]: {
                    [RESOURCE.STAFF]: true,
                    [RESOURCE.STUDENT]: true,
                    [RESOURCE.ADMIN]: true,
                },
                [RESOURCE.BATCH_ANALYSIS]: true,
            },
            [OPERATIONS.UPDATE]: {
                [RESOURCE.ATTENDANCE]: true,
                [RESOURCE.STAFF]: true,
                [RESOURCE.STUDENT]: true,
                [RESOURCE.BRANCH]: true,
                [RESOURCE.SELF]: true,
                [RESOURCE.SELF_NOT_ALLOWED_FIELDS]: ['role', 'tokens'],
                [RESOURCE.NOT_ALLOWED_FIELDS]: ['role', 'tokens'],
            },
            [OPERATIONS.DELETE]: {
                [RESOURCE.STAFF]: true,
                [RESOURCE.STUDENT]: true,
                [RESOURCE.BRANCH]: true,
                [RESOURCE.ATTENDANCE]: true,
            },
        },
        [ROLE.STAFF]: {
            [OPERATIONS.CREATE]: {
                [RESOURCE.STUDENT]: true,
                [RESOURCE.ATTENDANCE]: true,
            },
            [OPERATIONS.READ]: {
                [RESOURCE.STAFF]: true,
                [RESOURCE.SELF]: true,
                [RESOURCE.STUDENT]: true,
                [RESOURCE.ATTENDANCE]: true,
                [RESOURCE.BRANCH]: true,
                [RESOURCE.BATCH_ANALYSIS]: true,
                [RESOURCE.ANALYSIS]: {
                    [RESOURCE.STAFF]: true,
                    [RESOURCE.STUDENT]: true,
                },
            },
            [OPERATIONS.UPDATE]: {
                [RESOURCE.STUDENT]: true,
                [RESOURCE.ATTENDANCE]: true,
                [RESOURCE.SELF]: true,
                [RESOURCE.SELF_NOT_ALLOWED_FIELDS]: ['role', 'branchId', 'tokens'],
                [RESOURCE.NOT_ALLOWED_FIELDS]: ['role', 'branchId', 'tokens', 'batch', 'branchName'],
            },
            [OPERATIONS.DELETE]: {
                [RESOURCE.STUDENT]: true,
                [RESOURCE.ATTENDANCE]: true,
            },
        },
        [ROLE.STUDENT]: {
            [OPERATIONS.CREATE]: {},
            [OPERATIONS.READ]: {
                [RESOURCE.SELF]: true,
            },
            [OPERATIONS.UPDATE]: {
                [RESOURCE.SELF]: true,
                [RESOURCE.SELF_NOT_ALLOWED_FIELDS]: ['role', 'tokens', 'branchId', 'batch', 'branchName', 'currentSemester'],
            },
            [OPERATIONS.DELETE]: {},
        },
    };

    /**
     *
     * @param {RoleType} role - role of the user which has logged in
     * @param {OperationsType} operation - crud operation that is to be done
     * @param {ResourceType} resource - access given to specifc roles
     * @returns true if allowed other wise false or undefined
     */
    checkAccessPermission(role: RoleType, operation: OperationsType, resource: ResourceType) {
        return this.roles[role][operation]?.[resource];
    }
}
