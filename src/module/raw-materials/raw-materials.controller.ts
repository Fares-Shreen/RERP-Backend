import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { RawMaterialsService } from './raw-materials.service';
import { CreateRawMaterialDto, rawMaterialFilterDto, UpdateRawMaterialDto } from './raw-material.dto/raw_material.dto';
import { tokenEnum } from 'src/common/enums/token.enum';
import { Roles, tokenTypeDecorator } from 'src/common/decorators/auth/auth.decorator';
import { employee_role_Enum } from 'src/common/enums/employee.enum';
import { AuthenticationGuard } from 'src/common/guards/authentication/authentication.guard';
import { AuthorizationGuard } from 'src/common/guards/authorization/authorization.guard';
import type { hydartedEmployeeDoc } from 'src/DB/models/employee.model';

@Controller('raw-material')
export class RawMaterialsController {
  constructor(private readonly rawMaterialsService: RawMaterialsService) { }

  @tokenTypeDecorator(tokenEnum.accessToken)
  @Roles([employee_role_Enum.admin, employee_role_Enum.manager])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Post('/create')
  create(@Body() createRawMaterialDto: CreateRawMaterialDto, @Req() req: hydartedEmployeeDoc) {
    const employeeId = req.id;
    return this.rawMaterialsService.create(createRawMaterialDto, employeeId);
  }


  @tokenTypeDecorator(tokenEnum.accessToken)
  @UseGuards(AuthenticationGuard)
  @Get()
  findAll(@Query() query: rawMaterialFilterDto) {
    return this.rawMaterialsService.findAll(query);
  }

  @tokenTypeDecorator(tokenEnum.accessToken)
  @UseGuards(AuthenticationGuard)
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.rawMaterialsService.findById(id);
  }

  @tokenTypeDecorator(tokenEnum.accessToken)
  @Roles([employee_role_Enum.admin, employee_role_Enum.manager])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Patch('/update/:id')
  update(@Param('id') id: string, @Body() updateRawMaterialDto: UpdateRawMaterialDto) {
    return this.rawMaterialsService.update(id, updateRawMaterialDto);
  }

  @tokenTypeDecorator(tokenEnum.accessToken)
  @Roles([employee_role_Enum.admin, employee_role_Enum.manager])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Delete('/delete/:id')
  remove(@Param('id') id: string) {
    return this.rawMaterialsService.remove(id);
  }
  @tokenTypeDecorator(tokenEnum.accessToken)
  @Roles([employee_role_Enum.admin, employee_role_Enum.manager])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Patch('/restore/:id')
  restore(@Param('id') id: string) {
    return this.rawMaterialsService.restore(id);
  }
}