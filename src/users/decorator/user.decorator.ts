import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthedUserType } from 'src/types/user.types';
import { User } from '../users.schema';

export const AuthedUser = createParamDecorator((data: keyof User | undefined, ctx: ExecutionContext) : User | User[keyof User] => {
    const request = ctx.switchToHttp().getRequest<AuthedUserType>();
    const user = request.user;

    return data ? user[data] : user;
});
