import { Module } from '@nestjs/common';
import { AccessControlService } from './access-control.service';
import { AccessControlGuard } from './access-control.guard';
import { AccessControl } from './decorator/access-control.decorator';

@Module({
    providers: [AccessControlGuard, AccessControlService],
    exports: [AccessControlGuard, AccessControlService]
})
export class AccessControlModule {}
