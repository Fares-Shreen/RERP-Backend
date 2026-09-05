import { Module } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { RecipeController } from './recipe.controller';
import { AuthModule } from '../auth/auth.module';
import { CategoryModel} from '../../DB/models/category.model';
import { RawMaterialModel } from '../../DB/models/raw_material.model';
import { RecipeModel } from 'src/DB/models/recipe.model';
import { RecipeRepository } from 'src/DB/repositories/recipe.repository';
import { RawMaterialRepository } from 'src/DB/repositories/raw_material.repository';
import { CategoryRepository } from 'src/DB/repositories/category.repository';

@Module({
  imports: [AuthModule,CategoryModel,RawMaterialModel,RecipeModel],
  controllers: [RecipeController],
  providers: [RecipeService,CategoryRepository,RawMaterialRepository,RecipeRepository],
})
export class RecipeModule {}
