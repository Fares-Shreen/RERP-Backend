import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Types, Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { RawMaterialRepository } from '../../DB/repositories/raw_material.repository';
import InventoryTransactionRepository from 'src/DB/repositories/Inventory.repository';
import SupplierRepository from 'src/DB/repositories/supplierRepository';
import { transaction_type_Enum } from 'src/common/enums/inventory.enum';
import { CreateInventoryTransactionDto, InventoryTransactionFilterDto } from './dto/inventorydto';

@Injectable()
export class InventoryService {
  constructor(
    private readonly transactionRepository: InventoryTransactionRepository,
    private readonly rawMaterialRepository: RawMaterialRepository,
    private readonly supplierRepository: SupplierRepository,
    @InjectConnection() private readonly connection: Connection,
  ) { }

  async createTransaction(dto: CreateInventoryTransactionDto, employeeId: string) {
    if (!Types.ObjectId.isValid(dto.rawMaterialId)) {
      throw new ConflictException('Invalid raw material ID format');
    }

    const material = await this.rawMaterialRepository.findOne({
      filter: { _id: new Types.ObjectId(dto.rawMaterialId) },
    });

    if (!material) {
      throw new NotFoundException('Raw material not found');
    }

    if (dto.type === transaction_type_Enum.PURCHASE) {
      if (!dto.supplierId) {
        throw new ConflictException('A supplierId is required for PURCHASE transactions');
      }
      if (!Types.ObjectId.isValid(dto.supplierId)) {
        throw new ConflictException('Invalid supplier ID format');
      }

      const supplierExists = await this.supplierRepository.exists({
        filter: { _id: new Types.ObjectId(dto.supplierId) },
      });

      if (!supplierExists) {
        throw new NotFoundException('Supplier not found');
      }
    }

    const previousStock = material.currentStock;
    let newStock = 0;
    let ledgerQuantity = dto.quantityChanged;

    switch (dto.type) {
      case transaction_type_Enum.PURCHASE:
        newStock = previousStock + dto.quantityChanged;
        break;

      case transaction_type_Enum.USAGE:
      case transaction_type_Enum.WASTE:
        if (previousStock < dto.quantityChanged) {
          throw new ConflictException(`Insufficient stock. Available: ${previousStock}, Requested deduction: ${dto.quantityChanged}`);
        }
        newStock = previousStock - dto.quantityChanged;
        break;

      case transaction_type_Enum.ADJUSTMENT:
        newStock = dto.quantityChanged;
        ledgerQuantity = newStock - previousStock;

        if (ledgerQuantity === 0) {
          throw new ConflictException('The new stock is exactly the same as the current stock. No adjustment needed.');
        }
        break;

      default:
        throw new ConflictException('Invalid transaction type');
    }

    // const session = await this.connection.startSession();
    // session.startTransaction();

    try {
      const updatedMaterial = await this.rawMaterialRepository.findOneAndUpdate({
        filter: { _id: material._id },
        update: { $set: { currentStock: newStock } },
        options: { new: true },
        // options: { session, new: true },
      });

      if (!updatedMaterial) {
        throw new InternalServerErrorException('Failed to update raw material stock');
      }

      const transaction = await this.transactionRepository.create({
        rawMaterialId: material._id,
        type: dto.type,
        quantityChanged: ledgerQuantity,
        previousStock,
        newStock,
        supplierId: dto.supplierId ? new Types.ObjectId(dto.supplierId) : undefined,
        notes: dto.notes,
        createdBy: new Types.ObjectId(employeeId),
      }, 
      // { session }
    );

      // await session.commitTransaction();
      return transaction;

    } catch (error) {
      // await session.abortTransaction();
      const message = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(`Transaction failed: ${message}`);
    } finally {
      // await session.endSession();
    }
  }

  async findAll(query: InventoryTransactionFilterDto) {
    const { search, page = 1, limit = 10 } = query;

    return this.transactionRepository.pagination({
      page,
      limit,
      populate: [
        {
          path: 'rawMaterial',
          select: 'name sku',
        },
        {
          path: 'supplier',
          select: 'name',
        },
      ],
      search: search
        ? {
          $or: [{ notes: { $regex: search, $options: 'i' } }],
        }
        : {},
    });
  }
}