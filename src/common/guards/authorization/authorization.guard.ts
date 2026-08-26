import { BadGatewayException, CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ACCESS_ROLES_KEY } from 'src/common/decorators/auth/auth.decorator';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    
    const requiredRoles = this.reflector.get<string[]>(ACCESS_ROLES_KEY, context.getHandler());

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    let req: any;
    if (context.getType() === 'http') {
      req = context.switchToHttp().getRequest();
    } else if (context.getType() === 'ws') {
      req = context.switchToWs().getClient();
    } else if (context.getType() === 'rpc') {
      req = context.switchToRpc().getContext();
    }

    if (!req || !req.user) {
      throw new ForbiddenException('Authentication required');
    }

    const hasRole = requiredRoles.includes(req.user.role);

    if (!hasRole) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }
    return true;
  }
}