import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { RawMaterialRepository } from '../../DB/repositories/raw_material.repository';
import { Types } from 'mongoose';
import { CreateRawMaterialDto, rawMaterialFilterDto, UpdateRawMaterialDto } from './raw-material.dto/raw_material.dto';
import CategoryRepository from 'src/DB/repositories/category.repository';
import SupplierRepository from 'src/DB/repositories/supplierRepository';

@Injectable()
export class RawMaterialsService {
  constructor(private readonly rawMaterialRepository: RawMaterialRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly supplierRepository: SupplierRepository) { }

  async create(dto: CreateRawMaterialDto, employeeId: string) {
    const existingMaterial = await this.rawMaterialRepository.findOne({
      filter: { sku: dto.sku },
    });
    if (existingMaterial) {
      throw new ConflictException('Raw material with this SKU already exists');
    }

    const existingName = await this.rawMaterialRepository.findOne({
      filter: { name: dto.name },
    });

    if (existingName) {
      throw new ConflictException('Raw material with this name already exists');
    }

    const categoryId = dto.categoryId ? new Types.ObjectId(dto.categoryId) : undefined;
    if (categoryId) {
      const categoryExists = await this.categoryRepository.exists({
        filter: { _id: categoryId },
      });

      if (!categoryExists) {
        throw new NotFoundException('Category not found');
      }
    }

    const rawMaterial = await this.rawMaterialRepository.create({
      ...dto,
      categoryId: categoryId,
      createdBy: new Types.ObjectId(employeeId),
    });

    if (!rawMaterial) {
      throw new ConflictException('Failed to create raw material');
    }

    return rawMaterial;
  }

  async findAll(query: rawMaterialFilterDto) {
    const { page = 1, limit = 10, search } = query;

    const materialsData = await this.rawMaterialRepository.pagination({
      page,
      limit,
      populate: [
        {
          path: 'category',
          select: 'name',
        },
      ],
      search: search
        ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { sku: { $regex: search, $options: 'i' } },
          ],
        }
        : {},
    });

    return materialsData;
  }

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new ConflictException('Invalid raw material ID format');
    }

    const rawMaterial = await this.rawMaterialRepository.findOne({
      filter: { _id: new Types.ObjectId(id) },
      options: {
        populate: [
          {
            path: 'category',
            select: 'name',
          },
        ],
      }
    });

    if (!rawMaterial) {
      throw new NotFoundException('Raw material not found');
    }

    return rawMaterial;
  }

  async update(id: string, dto: UpdateRawMaterialDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new ConflictException('Invalid raw material ID format');
    }

    const existingMaterial = await this.rawMaterialRepository.findOne({
      filter: { _id: new Types.ObjectId(id) },
    });
    if (!existingMaterial) {
      throw new NotFoundException('Raw material not found');
    }

    if (dto.sku) {
      const existingMaterial = await this.rawMaterialRepository.findOne({
        filter: { sku: dto.sku },
      });
      if (existingMaterial && existingMaterial._id.toString() !== id) {
        throw new ConflictException('Another raw material already has this SKU');
      }
    }

    if (dto.categoryId) {
      const categoryExists = await this.categoryRepository.exists({
        filter: { _id: new Types.ObjectId(dto.categoryId) },
      });
      if (!categoryExists) {
        throw new NotFoundException('Category not found');
      }
    }

    if (dto.name) {
      const existingMaterial = await this.rawMaterialRepository.findOne({
        filter: { name: dto.name },
      });
      if (existingMaterial && existingMaterial._id.toString() !== id) {
        throw new ConflictException('Another raw material already has this name');
      }
    }

    const updatePayload: any = { ...dto };
    if (dto.categoryId) {
      updatePayload.category = new Types.ObjectId(dto.categoryId);
    }

    const updatedMaterial = await this.rawMaterialRepository.findOneAndUpdate({
      filter: { _id: new Types.ObjectId(id) },
      update: { $set: updatePayload },
      options: { new: true },
    });

    if (!updatedMaterial) {
      throw new NotFoundException('Raw material not found');
    }

    return updatedMaterial;
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new ConflictException('Invalid raw material ID format');
    }

    const deletedMaterial = await this.rawMaterialRepository.softDelete({
      filter: { _id: new Types.ObjectId(id) },
    });

    if (!deletedMaterial) {
      throw new NotFoundException('Raw material not found');
    }

    return { message: 'Raw material successfully deleted' };
  }
  async restore(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new ConflictException('Invalid raw material ID format');
    }

    const restoredMaterial = await this.rawMaterialRepository.restore({
      filter: { _id: new Types.ObjectId(id) },
    });

    if (!restoredMaterial) {
      throw new NotFoundException('Raw material not found');
    }

    return {
      message: 'Raw material successfully restored',
    };
  }

}