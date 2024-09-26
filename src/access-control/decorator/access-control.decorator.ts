import { SetMetadata } from '@nestjs/common';
import { OperationsType, ResourceType } from '../../constants';

export enum ACCESS_CONTROL_METADATA_KEYS {
    OPERATION_KEY = 'operation',
    RESOURCE_KEY = 'resource',
}

export const AccessControl = (operation: OperationsType | false, resource?: ResourceType) => {
    return (target: object, key?: string | symbol, descriptor?: PropertyDescriptor) => {
        SetMetadata(ACCESS_CONTROL_METADATA_KEYS.OPERATION_KEY, operation)(target, key, descriptor);
        SetMetadata(ACCESS_CONTROL_METADATA_KEYS.RESOURCE_KEY, resource)(target, key, descriptor);
    };
};
