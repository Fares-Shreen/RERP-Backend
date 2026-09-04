import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { RawMaterialRepository } from '../../DB/repositories/raw_material.repository';
import { CreateSupplierDto, SupplierFilterDto, UpdateSupplierDto } from './dto/create-supplier.dto';
import SupplierRepository from 'src/DB/repositories/supplierRepository';


@Injectable()
export class SupplierService {
  constructor(
    private readonly supplierRepository: SupplierRepository,
    private readonly rawMaterialRepository: RawMaterialRepository,
  ) { }

  async create(dto: CreateSupplierDto, employeeId: string) {
    const orConditions: any[] = [
      { name: dto.name },
      { phoneNumber: dto.phoneNumber },
    ];
    if (dto.email) orConditions.push({ email: dto.email });

    const existingSupplier = await this.supplierRepository.findOne({
      filter: { $or: orConditions },
    });

    if (existingSupplier) {
      if (existingSupplier.name === dto.name) {
        throw new ConflictException('Supplier with this name already exists');
      }
      if (existingSupplier.phoneNumber === dto.phoneNumber) {
        throw new ConflictException('Supplier with this phone number already exists');
      }
      if (dto.email && existingSupplier.email === dto.email) {
        throw new ConflictException('Supplier with this email already exists');
      }
    }

    const rawMaterialObjectIds = [] as Types.ObjectId[];
    if (dto.rawMaterialsIds && dto.rawMaterialsIds.length > 0) {
      for (const rmId of dto.rawMaterialsIds) {
        if (!Types.ObjectId.isValid(rmId)) {
          throw new ConflictException(`Invalid raw material ID format: ${rmId}`);
        }

        const materialExists = await this.rawMaterialRepository.findOne({
          filter: { _id: new Types.ObjectId(rmId) },
        });

        if (!materialExists) {
          throw new NotFoundException(`Raw material with ID ${rmId} not found`);
        }
        rawMaterialObjectIds.push(new Types.ObjectId(rmId));
      }
    }

    const supplier = await this.supplierRepository.create({
      ...dto,
      rawMaterialsIds: rawMaterialObjectIds,
      createdBy: new Types.ObjectId(employeeId),
    });

    if (!supplier) {
      throw new ConflictException('Failed to create supplier');
    }

    return supplier;
  }

  async findAll(query: SupplierFilterDto) { 
    const { page = 1, limit = 10, search } = query;

    return this.supplierRepository.pagination({
      page,
      limit,
      populate: [
        {
          path: 'rawMaterials',
          select: 'name sku categoryId',
          populate: {
            path: 'category',
            select: 'name',
          },
        },
      ],
      search: search
        ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { phoneNumber: { $regex: search, $options: 'i' } },
            { companyName: { $regex: search, $options: 'i' } },
          ],
        }
        : {},
    });
  }

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new ConflictException('Invalid supplier ID format');
    }

    const supplier = await this.supplierRepository.findOne({
      filter: { _id: new Types.ObjectId(id) },
      options: {
        populate: [
          {
            path: 'rawMaterials',
            select: 'name sku',
            populate: {
              path: 'category',
              select: 'name',
            },
          },
        ]
      }
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    return supplier;
  }

  async update(id: string, dto: UpdateSupplierDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new ConflictException('Invalid supplier ID format');
    }

    const orConditions: any[] = [];
    if (dto.name) orConditions.push({ name: dto.name });
    if (dto.phoneNumber) orConditions.push({ phoneNumber: dto.phoneNumber });
    if (dto.email) orConditions.push({ email: dto.email });

    if (orConditions.length > 0) {
      const existingSupplier = await this.supplierRepository.findOne({
        filter: { $or: orConditions },
      });

      if (existingSupplier && existingSupplier._id.toString() !== id) {
        if (dto.name && existingSupplier.name === dto.name) {
          throw new ConflictException('Another supplier already has this name');
        }
        if (dto.phoneNumber && existingSupplier.phoneNumber === dto.phoneNumber) {
          throw new ConflictException('Another supplier already has this phone number');
        }
        if (dto.email && existingSupplier.email === dto.email) {
          throw new ConflictException('Another supplier already has this email');
        }
      }
    }


    const updatePayload: any = { ...dto };

    if (dto.rawMaterialsIds) {
      const rawMaterialObjectIds = [] as Types.ObjectId[];
      for (const rmId of dto.rawMaterialsIds) {
        if (!Types.ObjectId.isValid(rmId)) {
          throw new ConflictException(`Invalid raw material ID format: ${rmId}`);
        }
        const materialExists = await this.rawMaterialRepository.findOne({
          filter: { _id: new Types.ObjectId(rmId) },
        });
        if (!materialExists) {
          throw new NotFoundException(`Raw material with ID ${rmId} not found`);
        }
        rawMaterialObjectIds.push(new Types.ObjectId(rmId));
      }
      updatePayload.rawMaterialsIds = rawMaterialObjectIds;
    }

    const updatedSupplier = await this.supplierRepository.findOneAndUpdate({
      filter: { _id: new Types.ObjectId(id) },
      update: { $set: updatePayload },
      options: { new: true },
    });

    if (!updatedSupplier) {
      throw new NotFoundException('Supplier not found');
    }

    return updatedSupplier;
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new ConflictException('Invalid supplier ID format');
    }

    const deletedSupplier = await this.supplierRepository.softDelete({
      filter: { _id: new Types.ObjectId(id) },
    });

    if (!deletedSupplier) {
      throw new NotFoundException('Supplier not found');
    }

    return { message: 'Supplier successfully deleted' };
  }
  async restore(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new ConflictException('Invalid supplier ID format');
    }

    const restoredSupplier = await this.supplierRepository.restore({
      filter: { _id: new Types.ObjectId(id) },
    });

    if (!restoredSupplier) {
      throw new NotFoundException('Supplier not found');
    }

    return { message: 'Supplier successfully restored' };
  }
}