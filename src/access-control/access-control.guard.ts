import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { AccessControlService } from './access-control.service';
import { ACCESS_CONTROL_METADATA_KEYS } from './decorator/access-control.decorator';
import { OPERATIONS, RESOURCE } from 'src/constants/role.constants';

@Injectable()
export class AccessControlGuard implements CanActivate {
    private readonly log = new Logger(AccessControlGuard.name)
    
    constructor(
        private readonly reflector: Reflector,
        private readonly accessControlService: AccessControlService,
    ) {}
    
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const operationRequested = this.reflector.get<OPERATIONS | false>(ACCESS_CONTROL_METADATA_KEYS.OPERATION_KEY, context.getHandler());
        const resourceRequested = this.reflector.get<RESOURCE>(ACCESS_CONTROL_METADATA_KEYS.RESOURCE_KEY, context.getHandler());
        const request = context.switchToHttp().getRequest();
        const role = request.user.role;
        
        if(operationRequested === false){
            return true; // skipping the access control check
        }

        // operationRequired resource will always be present
        if(!resourceRequested || !role){
            return false
        }

        // this only handles the static access control, for dynamic the logic is implemented in service module
        const hasPermission = this.accessControlService.checkAccessPermission(role, operationRequested, resourceRequested)
        
        return hasPermission;
    }
}
