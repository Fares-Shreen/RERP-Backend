import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { EmplyeeModel } from 'src/DB/models/employee.model';
import EmployeeRepository from 'src/DB/repositories/employee.repository';

@Module({
  imports:[EmplyeeModel],
  controllers: [EmployeeController],
  providers: [EmployeeService,EmployeeRepository],
})
export class EmployeeModule {}
