import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryFilterDto, CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { tokenEnum } from 'src/common/enums/token.enum';
import { Roles, tokenTypeDecorator } from 'src/common/decorators/auth/auth.decorator';
import { employee_role_Enum} from 'src/common/enums/employee.enum';
import { AuthenticationGuard } from 'src/common/guards/authentication/authentication.guard';
import { AuthorizationGuard } from 'src/common/guards/authorization/authorization.guard';
import type { hydartedEmployeeDoc } from 'src/DB/models/employee.model';


@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  @tokenTypeDecorator(tokenEnum.accessToken)
  @Roles([employee_role_Enum.admin, employee_role_Enum.manager])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Post("/create")
  create(@Body() createCategoryDto: CreateCategoryDto, @Req() req: hydartedEmployeeDoc) {
    return this.categoryService.create(createCategoryDto,req.id);
  }
  @tokenTypeDecorator(tokenEnum.accessToken)
  @Roles([employee_role_Enum.admin, employee_role_Enum.manager])
  @UseGuards(AuthenticationGuard)
  @Get()
  findAll(@Query() query: CategoryFilterDto) {
    return this.categoryService.findAll(query);
  }
  @tokenTypeDecorator(tokenEnum.accessToken)
  @UseGuards(AuthenticationGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findById(id);
  }
  @tokenTypeDecorator(tokenEnum.accessToken)
  @Roles([employee_role_Enum.admin, employee_role_Enum.manager])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Patch('/update/:id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategoryDto);
  }
  @tokenTypeDecorator(tokenEnum.accessToken)
  @Roles([employee_role_Enum.admin, employee_role_Enum.manager])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Delete('/delete/:id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
  @tokenTypeDecorator(tokenEnum.accessToken)
  @Roles([employee_role_Enum.admin, employee_role_Enum.manager])
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Patch('/restore/:id')
  restore(@Param('id') id: string) {
    return this.categoryService.restore(id);
  }
}
