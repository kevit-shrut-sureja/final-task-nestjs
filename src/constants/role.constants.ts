export enum ROLE {
    ADMIN = 'admin',
    STAFF = 'staff',
    STUDENT = 'student'
}

export enum OPERATIONS { 
    CREATE = 'create',
    READ = 'read', 
    UPDATE = 'update',
    DELETE = 'delete'
}

export enum RESOURCE { 
    // for user roles
    ADMIN = ROLE.ADMIN,
    STAFF = ROLE.STAFF,
    STUDENT = ROLE.STUDENT,

    // other resources
    BRANCH = 'branch',
    ATTENDANCE = 'attendance',
    ANALYSIS = 'analysis',
    SELF = 'self',
    NOT_ALLOWED_FIELDS = 'notAllowedFields',
    BATCH_ANALYSIS = 'batchAnalysis',
    SELF_NOT_ALLOWED_FIELDS ='selfNotAllowedFields'
};

// Extract's value from enum and make a union type see https://stackoverflow.com/questions/52393730/typescript-string-literal-union-type-from-enum/64966647#64966647
export type RoleType = `${ROLE}`
export type ResourceType = `${RESOURCE}`
export type OperationsType = `${OPERATIONS}`