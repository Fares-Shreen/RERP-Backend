import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { CreateRecipeDto, recipeFilterDto, UpdateRecipeDto } from './dto/recipe.dto';

import { tokenEnum } from 'src/common/enums/token.enum';
import { Roles, tokenTypeDecorator } from 'src/common/decorators/auth/auth.decorator';
import { employee_role_Enum } from 'src/common/enums/employee.enum';
import { AuthenticationGuard } from 'src/common/guards/authentication/authentication.guard';
import { AuthorizationGuard } from 'src/common/guards/authorization/authorization.guard';
import type { hydartedEmployeeDoc } from 'src/DB/models/employee.model';


@Controller('recipe')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) { }

  @tokenTypeDecorator(tokenEnum.accessToken)
  @Roles([employee_role_Enum.admin, employee_role_Enum.manager])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Post('/create')
  create(@Body() createRecipeDto: CreateRecipeDto, @Req() req: hydartedEmployeeDoc) {
    const employeeId = req.id;
    return this.recipeService.create(createRecipeDto, employeeId);
  }

  @tokenTypeDecorator(tokenEnum.accessToken)
  @UseGuards(AuthenticationGuard)
  @Get()
  findAll(@Query() query: recipeFilterDto) {
    return this.recipeService.findAll(query);
  }

  @tokenTypeDecorator(tokenEnum.accessToken)
  @UseGuards(AuthenticationGuard)
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.recipeService.findById(id);
  }

  @tokenTypeDecorator(tokenEnum.accessToken)
  @Roles([employee_role_Enum.admin, employee_role_Enum.manager])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Patch('/update/:id')
  update(@Param('id') id: string, @Body() updateRecipeDto: UpdateRecipeDto) {
    return this.recipeService.update(id, updateRecipeDto);
  }

  @tokenTypeDecorator(tokenEnum.accessToken)
  @Roles([employee_role_Enum.admin, employee_role_Enum.manager])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Delete('/delete/:id')
  remove(@Param('id') id: string) {
    return this.recipeService.remove(id);
  }

  @tokenTypeDecorator(tokenEnum.accessToken)
  @Roles([employee_role_Enum.admin, employee_role_Enum.manager])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Patch('/restore/:id')
  restore(@Param('id') id: string) {
    return this.recipeService.restore(id);
  }
}