import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Employee = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const employee = request.user;

        return data ? employee?.[data] : employee;
    },
);