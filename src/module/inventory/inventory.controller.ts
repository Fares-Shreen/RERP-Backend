import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { CreateInventoryTransactionDto, InventoryTransactionFilterDto } from './dto/inventorydto';
import { tokenEnum } from 'src/common/enums/token.enum';
import { Roles, tokenTypeDecorator } from 'src/common/decorators/auth/auth.decorator';
import { employee_role_Enum } from 'src/common/enums/employee.enum';
import { AuthenticationGuard } from 'src/common/guards/authentication/authentication.guard';
import { AuthorizationGuard } from 'src/common/guards/authorization/authorization.guard';
import { InventoryService } from './inventory.service';
import type { hydartedEmployeeDoc } from 'src/DB/models/employee.model';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) { }


  @tokenTypeDecorator(tokenEnum.accessToken)
  @Roles([employee_role_Enum.admin, employee_role_Enum.manager])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Post('/transaction')
  createTransaction(@Body() dto: CreateInventoryTransactionDto, @Req() req: hydartedEmployeeDoc) {
    const employeeId = req.id;
    return this.inventoryService.createTransaction(dto, employeeId);
  }


  @tokenTypeDecorator(tokenEnum.accessToken)
  @Roles([employee_role_Enum.admin, employee_role_Enum.manager])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Get('/ledger')
  findAll(@Query() query: InventoryTransactionFilterDto) {
    return this.inventoryService.findAll(query);
  }
}