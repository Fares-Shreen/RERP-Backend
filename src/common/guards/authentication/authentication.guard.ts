import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { TOKEN_TYPE_KEY } from 'src/common/decorators/auth/auth.decorator';
import { tokenEnum } from 'src/common/enums/token.enum';
import { TokenService } from 'src/common/utils/services/token/token.service';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private tokenService: TokenService,private reflector:Reflector) { }
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    try{
      let req: any;
      let authHeader:any;
      let token = '';
      let prefix = '';
      if (context.getType() === 'http') {
        req = context.switchToHttp().getRequest();
        authHeader = await req.headers.authorization;
      }
      else if (context.getType() === 'ws') {
        req = context.switchToWs().getClient();
        authHeader = await req.handshake.headers.authorization;
      }
      else if (context.getType() === 'rpc') {
        req = context.switchToRpc().getContext();
        authHeader = await req.headers.authorization;
      }

      if (authHeader) {
        [prefix, token] = authHeader.split(' ');
      }

      if (!token || !prefix) {
        throw new Error("No token or prefix provided");
      }

      const tokenType = this.reflector.get<string>(TOKEN_TYPE_KEY, context.getHandler());
      if (!tokenType) {
        throw new Error("No token type provided");
      }

      const {ACCESS_SECRET_KEY, REFRESH_SECRET_KEY} = await this.tokenService.accessSignature(prefix);
      const secret_key = tokenType === tokenEnum.accessToken ? ACCESS_SECRET_KEY : REFRESH_SECRET_KEY;
      const {user , decoded} = await this.tokenService.decodeToken_fetchUser(token, secret_key);
      req.user = user;
      req.decoded = decoded;
      return true;
    }
    catch(err){
        throw new UnauthorizedException("Token is invalid or expired");
    }
    }
  }
