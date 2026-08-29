import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto, EmployeeFilterDto, UpdateEmployeeDto } from './dto/employee.dto';
import { Roles, tokenTypeDecorator } from 'src/common/decorators/auth/auth.decorator';
import { tokenEnum } from 'src/common/enums/token.enum';
import { employee_role_Enum } from 'src/common/enums/employee.enum';
import { AuthorizationGuard } from 'src/common/guards/authorization/authorization.guard';
import { AuthenticationGuard } from 'src/common/guards/authentication/authentication.guard';
import { Employee } from 'src/common/decorators/employee/employee.decorator';
import type { hydartedEmployeeDoc } from 'src/DB/models/employee.model';
import { Types } from 'mongoose';

@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}
  // @tokenTypeDecorator(tokenEnum.accessToken)
  // @Roles([employee_role_Enum.admin])
  // @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Post("/create")
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.create(new Types.ObjectId("6a8e4a8e3dcfa0bd4abb00f5"), createEmployeeDto);
  }
  @tokenTypeDecorator(tokenEnum.accessToken)
  // @Roles([employee_role_Enum.manager])
  @UseGuards(AuthenticationGuard)

  @Get("/all")
  findAll(@Query() query: EmployeeFilterDto) {
    return this.employeeService.findAll(query);
  }
  // @tokenTypeDecorator(tokenEnum.accessToken)
  // @Roles([employee_role_Enum.admin])
  // @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Get(':employeeId')
  findOne(@Param('employeeId') employeeId: string) {
    return this.employeeService.findOne(employeeId);
  }
  // @tokenTypeDecorator(tokenEnum.accessToken)
  // @Roles([employee_role_Enum.admin])
  // @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Patch('/update/:employeeId')
  update(@Param('employeeId') employeeId: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeeService.update(employeeId, updateEmployeeDto);
  }
  // @tokenTypeDecorator(tokenEnum.accessToken)
  // @Roles([employee_role_Enum.admin])
  // @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Delete('/delete/:employeeId')
  remove(@Param('employeeId') employeeId: string) {
    return this.employeeService.remove(employeeId);
  }
  

}
