import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { RecipeRepository } from '../../DB/repositories/recipe.repository';
import { CategoryRepository } from '../../DB/repositories/category.repository';
import { RawMaterialRepository } from '../../DB/repositories/raw_material.repository';
import { CreateRecipeDto, recipeFilterDto, UpdateRecipeDto } from './dto/recipe.dto';
@Injectable()
export class RecipeService {
  constructor(
    private readonly recipeRepository: RecipeRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly rawMaterialRepository: RawMaterialRepository,
  ) { }

  async create(dto: CreateRecipeDto, employeeId: string) {

    const existingRecipe = await this.recipeRepository.findOne({
      filter: { $or: [{ name: dto.name }, { sku: dto.sku }] },
    });

    if (existingRecipe) {
      if (existingRecipe.name === dto.name) throw new ConflictException('Recipe with this name already exists');
      if (existingRecipe.sku === dto.sku) throw new ConflictException('Recipe with this SKU already exists');
    }

    const categoryExists = await this.categoryRepository.exists({
      filter: { _id: new Types.ObjectId(dto.categoryId) },
    });
    if (!categoryExists) {
      throw new NotFoundException('Category not found');
    }

    let estimatedCost = 0;
    const processedIngredients = [] as any;

    for (const ingredient of dto.ingredients) {
      if (!Types.ObjectId.isValid(ingredient.rawMaterial)) {
        throw new ConflictException(`Invalid raw material ID format: ${ingredient.rawMaterial}`);
      }

      const material = await this.rawMaterialRepository.findOne({
        filter: { _id: new Types.ObjectId(ingredient.rawMaterial) },
      });

      if (!material) {
        throw new NotFoundException(`Raw material with ID ${ingredient.rawMaterial} not found`);
      }
      const materialPrice = material.pricePerUnit || 0;
      estimatedCost += materialPrice * ingredient.quantity;

      processedIngredients.push({
        rawMaterial: new Types.ObjectId(ingredient.rawMaterial),
        quantity: ingredient.quantity,
      });
    }

    const recipe = await this.recipeRepository.create({
      ...dto,
      categoryId: new Types.ObjectId(dto.categoryId),
      ingredients: processedIngredients,
      estimatedCost,
      createdBy: new Types.ObjectId(employeeId),
    });

    if (!recipe) {
      throw new ConflictException('Failed to create recipe');
    }

    return recipe;
  }

  async findAll(query: recipeFilterDto) {
    const { page = 1, limit = 10, search } = query;

    return this.recipeRepository.pagination({
      page,
      limit,
      search: search
        ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { sku: { $regex: search, $options: 'i' } },
          ],
        }
        : {},
    });
  }

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new ConflictException('Invalid recipe ID format');
    }

    const recipe = await this.recipeRepository.findOne({
      filter: { _id: new Types.ObjectId(id) },
      options: {
        populate: [
          {
            path: 'category',
            select: 'name',
          },
          {
            path: 'rawMaterials',
            select: 'name sku',
          }
        ]
      }
    });

    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    return recipe;
  }

  async update(id: string, dto: UpdateRecipeDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new ConflictException('Invalid recipe ID format');
    }


    if (dto.name || dto.sku) {
      const orConditions = [] as any;
      if (dto.name) orConditions.push({ name: dto.name });
      if (dto.sku) orConditions.push({ sku: dto.sku });

      const existingRecipe = await this.recipeRepository.findOne({
        filter: { $or: orConditions },
      });

      if (existingRecipe && existingRecipe._id.toString() !== id) {
        if (dto.name && existingRecipe.name === dto.name) throw new ConflictException('Another recipe already has this name');
        if (dto.sku && existingRecipe.sku === dto.sku) throw new ConflictException('Another recipe already has this SKU');
      }
    }

    const updatePayload: any = { ...dto };

    if (dto.categoryId) {
      const categoryExists = await this.categoryRepository.exists({
        filter: { _id: new Types.ObjectId(dto.categoryId) },
      });
      if (!categoryExists) throw new NotFoundException('Category not found');
      updatePayload.categoryId = new Types.ObjectId(dto.categoryId);
    }

    if (dto.ingredients) {
      let estimatedCost = 0;
      const processedIngredients = [] as any;

      for (const ingredient of dto.ingredients) {
        if (!Types.ObjectId.isValid(ingredient.rawMaterial)) {
          throw new ConflictException(`Invalid raw material ID format: ${ingredient.rawMaterial}`);
        }

        const material = await this.rawMaterialRepository.findOne({
          filter: { _id: new Types.ObjectId(ingredient.rawMaterial) },
        });

        if (!material) throw new NotFoundException(`Raw material with ID ${ingredient.rawMaterial} not found`);

        estimatedCost += (material.pricePerUnit || 0) * ingredient.quantity;

        processedIngredients.push({
          rawMaterial: new Types.ObjectId(ingredient.rawMaterial),
          quantity: ingredient.quantity,
        });
      }

      updatePayload.ingredients = processedIngredients;
      updatePayload.estimatedCost = estimatedCost;
    }

    const updatedRecipe = await this.recipeRepository.findOneAndUpdate({
      filter: { _id: new Types.ObjectId(id) },
      update: { $set: updatePayload },
      options: { new: true },
    });

    if (!updatedRecipe) {
      throw new NotFoundException('Recipe not found');
    }

    return updatedRecipe;
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new ConflictException('Invalid recipe ID format');
    }

    const deletedRecipe = await this.recipeRepository.softDelete({
      filter: { _id: new Types.ObjectId(id) },
    });

    if (!deletedRecipe) {
      throw new NotFoundException('Recipe not found');
    }

    return { message: 'Recipe successfully deleted' };
  }

  async restore(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new ConflictException('Invalid recipe ID format');
    }

    const restoredRecipe = await this.recipeRepository.restore({
      filter: { _id: new Types.ObjectId(id) },
    });

    if (!restoredRecipe) {
      throw new NotFoundException('Recipe not found');
    }

    return { message: 'Recipe successfully restored' };
  }
}