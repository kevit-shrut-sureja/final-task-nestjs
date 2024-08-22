import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    healthCheckPoint(): string {
        return 'Server is up and running...';
    }
}
