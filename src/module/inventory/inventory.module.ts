import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { AuthModule } from '../auth/auth.module';
import { RawMaterialModel } from 'src/DB/models/raw_material.model';
import { InventoryModel } from 'src/DB/models/Inventory.model';
import { SupplierModel } from 'src/DB/models/supplier.model';
import { SupplierRepository } from 'src/DB/repositories/supplierRepository';
import { InventoryRepository } from 'src/DB/repositories/Inventory.repository';
import { RawMaterialRepository } from 'src/DB/repositories/raw_material.repository';

@Module({
  imports: [AuthModule, RawMaterialModel, InventoryModel, SupplierModel],
  controllers: [InventoryController],
  providers: [InventoryService, RawMaterialRepository, InventoryRepository, SupplierRepository],
})
export class InventoryModule { }
