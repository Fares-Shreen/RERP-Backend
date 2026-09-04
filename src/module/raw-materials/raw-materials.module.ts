import { Module } from '@nestjs/common';
import { RawMaterialsService } from './raw-materials.service';
import { RawMaterialsController } from './raw-materials.controller';
import { redisService } from 'src/common/cache/redis.service';
import categoryRepository from 'src/DB/repositories/category.repository';
import { TokenService } from 'src/common/utils/services/token/token.service';
import employeeRepository from 'src/DB/repositories/employee.repository';
import { JwtService } from '@nestjs/jwt';
import { EmployeeModel } from 'src/DB/models/employee.model';
import { CategoryModel } from 'src/DB/models/category.model';
import { RawMaterialModel } from 'src/DB/models/raw_material.model';
import { RawMaterialRepository } from 'src/DB/repositories/raw_material.repository';
import { SupplierModel } from 'src/DB/models/supplier.model';
import SupplierRepository from 'src/DB/repositories/supplierRepository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [CategoryModel, EmployeeModel, RawMaterialModel, SupplierModel, AuthModule],
  controllers: [RawMaterialsController],
  providers: [RawMaterialsService, categoryRepository, employeeRepository, RawMaterialRepository, SupplierRepository],
})
export class RawMaterialsModule {}
