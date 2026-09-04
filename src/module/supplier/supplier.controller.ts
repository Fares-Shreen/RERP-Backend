import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/create-supplier.dto';
import { tokenEnum } from 'src/common/enums/token.enum';
import { Roles, tokenTypeDecorator } from 'src/common/decorators/auth/auth.decorator';
import { employee_role_Enum } from 'src/common/enums/employee.enum';
import { AuthenticationGuard } from 'src/common/guards/authentication/authentication.guard';
import { AuthorizationGuard } from 'src/common/guards/authorization/authorization.guard';
import type { hydartedEmployeeDoc } from 'src/DB/models/employee.model';

@Controller('supplier')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) { }

  @tokenTypeDecorator(tokenEnum.accessToken)
  @Roles([employee_role_Enum.admin, employee_role_Enum.manager])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Post('/create')
  create(@Body() createSupplierDto: CreateSupplierDto, @Req() req: hydartedEmployeeDoc) {
    const employeeId = req.id;
    return this.supplierService.create(createSupplierDto, employeeId);
  }

  @tokenTypeDecorator(tokenEnum.accessToken)
  @UseGuards(AuthenticationGuard)
  @Get()
  findAll(@Query() query: any) {
    return this.supplierService.findAll(query);
  }

  @tokenTypeDecorator(tokenEnum.accessToken)
  @UseGuards(AuthenticationGuard)
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.supplierService.findById(id);
  }

  @tokenTypeDecorator(tokenEnum.accessToken)
  @Roles([employee_role_Enum.admin, employee_role_Enum.manager])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Patch('/update/:id')
  update(@Param('id') id: string, @Body() updateSupplierDto: UpdateSupplierDto) {
    return this.supplierService.update(id, updateSupplierDto);
  }

  @tokenTypeDecorator(tokenEnum.accessToken)
  @Roles([employee_role_Enum.admin, employee_role_Enum.manager])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Delete('/delete/:id')
  remove(@Param('id') id: string) {
    return this.supplierService.remove(id);
  }

  @tokenTypeDecorator(tokenEnum.accessToken)
  @Roles([employee_role_Enum.admin, employee_role_Enum.manager])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Patch('/restore/:id')
  restore(@Param('id') id: string) {
    return this.supplierService.restore(id);
  }
}