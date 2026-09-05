import { IsEnum, IsNumber, IsOptional, IsString, IsMongoId, Min } from 'class-validator';
import { transaction_type_Enum } from 'src/common/enums/inventory.enum';
import { PartialType } from '@nestjs/mapped-types';

export class CreateInventoryTransactionDto {
    @IsMongoId({ message: 'Invalid raw material ID format' })
    rawMaterialId: string;

    @IsEnum(transaction_type_Enum, { message: 'Invalid transaction type' })
    type: transaction_type_Enum;

    @IsNumber()
    @Min(0.001, { message: 'Quantity changed must be greater than zero' })
    quantityChanged: number;

    @IsMongoId({ message: 'Invalid supplier ID format' })
    @IsOptional()
    supplierId?: string;

    @IsString()
    @IsOptional()
    notes?: string;
}

export class InventoryTransactionFilterDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    page?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    limit?: number;
}

export class UpdateInventoryTransactionDto extends PartialType(CreateInventoryTransactionDto) { }