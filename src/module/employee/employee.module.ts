import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { EmployeeModel } from 'src/DB/models/employee.model';
import EmployeeRepository from 'src/DB/repositories/employee.repository';
import { TokenService } from 'src/common/utils/services/token/token.service';
import redisService from 'src/common/cache/redis.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports:[EmployeeModel],
  controllers: [EmployeeController],
  providers: [EmployeeService,EmployeeRepository,TokenService,redisService,JwtService],
})
export class EmployeeModule {}
