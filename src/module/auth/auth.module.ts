import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import EmployeeRepository from 'src/DB/repositories/employee.repository';
import { EmployeeModel } from 'src/DB/models/employee.model';
import { TokenService } from 'src/common/utils/services/token/token.service';
import { JwtService } from '@nestjs/jwt';
import redisService from 'src/common/cache/redis.service';
import { RedisModule } from 'src/common/cache/redis.module';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [EmployeeModel, RedisModule ],
  controllers: [AuthController],
  providers: [AuthService,EmployeeRepository,TokenService,redisService,JwtService],
})
export class AuthModule {}
