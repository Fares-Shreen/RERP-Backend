import { Module } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { SupplierController } from './supplier.controller';
import { SupplierRepository } from 'src/DB/repositories/supplierRepository';
import RawMaterialRepository from 'src/DB/repositories/raw_material.repository';
import { redisService } from 'src/common/cache/redis.service';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from 'src/common/utils/services/token/token.service';
import { SupplierModel } from 'src/DB/models/supplier.model';
import { RawMaterialModel } from 'src/DB/models/raw_material.model';
import { AuthModule } from '../auth/auth.module';
import { EmployeeModel } from 'src/DB/models/employee.model';
import employeeRepository from 'src/DB/repositories/employee.repository';

@Module({
  imports: [SupplierModel,RawMaterialModel,AuthModule,EmployeeModel],
  controllers: [SupplierController],
  providers: [SupplierService, RawMaterialRepository, SupplierRepository,employeeRepository],
})
export class SupplierModule {}
