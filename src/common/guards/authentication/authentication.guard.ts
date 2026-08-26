import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TOKEN_TYPE_KEY } from 'src/common/decorators/auth/auth.decorator';
import { tokenEnum } from 'src/common/enums/token.enum';
import { TokenService } from 'src/common/utils/services/token/token.service';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private tokenService: TokenService, private reflector: Reflector) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      let req: any;
      let authHeader = '';
      let token = '';
      let prefix = '';
      
      if (context.getType() === 'http') {
        req = context.switchToHttp().getRequest();
        authHeader = await req.headers.authorization;
      } else if (context.getType() === 'ws') {
        req = await context.switchToWs().getClient();
        authHeader = req.handshake.headers.authorization;
      } else if (context.getType() === 'rpc') {
        req = await context.switchToRpc().getContext();
        authHeader = req.headers.authorization;
      }

      if (authHeader) {
        [prefix, token] = authHeader.split(' ');
      }

      if (!token || !prefix) {
        throw new UnauthorizedException("No token or prefix provided");
      }

      const tokenType = this.reflector.get<string>(TOKEN_TYPE_KEY, context.getHandler()) || tokenEnum.accessToken;

      const { ACCESS_SECRET_KEY, REFRESH_SECRET_KEY } = await this.tokenService.accessSignature(prefix);
      const secret_key = tokenType === tokenEnum.accessToken ? ACCESS_SECRET_KEY : REFRESH_SECRET_KEY;

      const { user, decoded, userType } = await this.tokenService.decodeToken_fetch(token, secret_key, prefix);

      req.user = user;
      req.userType = userType; // 'employee'or'customer'
      req.decoded = decoded;

      return true;

    } catch (err) {
      throw new UnauthorizedException("Token is invalid or expired");
    }
  }
}