import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Generic decorator with type T
export const AuthedUser = createParamDecorator(<T>(data: keyof T | undefined, ctx: ExecutionContext): T | T[keyof T] => {
    const request = ctx.switchToHttp().getRequest<{ user: T }>();
    const user = request.user;

    return data ? user[data] : user;
});
