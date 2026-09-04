import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CategoryModel } from 'src/DB/models/category.model';
import categoryRepository from 'src/DB/repositories/category.repository';
import { TokenService } from 'src/common/utils/services/token/token.service';
import { JwtService } from '@nestjs/jwt';
import { EmployeeModel } from 'src/DB/models/employee.model';
import employeeRepository from 'src/DB/repositories/employee.repository';
import { redisService } from 'src/common/cache/redis.service';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [CategoryModel,EmployeeModel,AuthModule],
  controllers: [CategoryController],
  providers: [CategoryService, categoryRepository,employeeRepository],
})
export class CategoryModule {}
