import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CategoryFilterDto, CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryRepository } from '../../DB/repositories/category.repository';
import { Types } from 'mongoose';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) { }

  async create(dto: CreateCategoryDto, employeeId: string) {
    const existingCategory = await this.categoryRepository.findOne({ filter: { name: dto.name } });

    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }

    const category = await this.categoryRepository.create({
      ...dto,
      createdBy: new Types.ObjectId(employeeId),
    });

    if (!category) {
      throw new ConflictException('Failed to create category');
    }

    return category;
  }

  async findAll(Query: CategoryFilterDto) {
    const { page = 1, limit = 10, search } = Query;

    const categorys_data = await this.categoryRepository.pagination({
      page, limit,
      populate:[
        {
          path: 'rawMaterials',
          select: 'name sku',
        }
      ]
       ,search: search ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
        ],
      } : { } });

    return categorys_data;
  }

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new ConflictException('Invalid category ID format');
    }
    const category = await this.categoryRepository.findOne({ 
      filter: { _id: new Types.ObjectId(id) },
      options: {
        populate: [
          {
            path: 'rawMaterials',
            select: 'name sku',
          },
        ],
      },
   });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    if (dto.name) {
      const existingCategory = await this.categoryRepository.findOne({ filter: { name: dto.name } });
      if (existingCategory && existingCategory._id.toString() !== id) {
        throw new ConflictException('Another category already has this name');
      }
    }
    const updatedCategory = await this.categoryRepository.findOneAndUpdate({
      filter: { _id: new Types.ObjectId(id) },
      update: { $set: dto },
      options: { new: true }
    });

    if (!updatedCategory) {
      throw new NotFoundException('Category not found');
    }
    return updatedCategory;
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new ConflictException('Invalid category ID format');
    }
    const deletedCategory = await this.categoryRepository.softDelete({ filter: { _id: new Types.ObjectId(id) } });
    if (!deletedCategory) {
      throw new NotFoundException('Category not found');
    }
    return { message: 'Category successfully deleted' };
  }
  async restore(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new ConflictException('Invalid category ID format');
    }
    const restoredCategory = await this.categoryRepository.restore({ filter: { _id: new Types.ObjectId(id) } });
    if (!restoredCategory) {
      throw new NotFoundException('Category not found');
    }
    return { message: 'Category successfully restored' };
  }
}