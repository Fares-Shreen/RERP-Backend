import { Type } from 'class-transformer';
import {
    IsString,
    IsNotEmpty,
    IsNumber,
    Min,
    IsEnum,
    IsOptional,
    IsMongoId
} from 'class-validator';
import { ApiPropertyOptional } from 'node_modules/@nestjs/swagger/dist/decorators/api-property.decorator';
import { PartialType } from '@nestjs/mapped-types';
import { raw_material_unit_Enum } from 'src/common/enums/raw_material.enum';

export class CreateRawMaterialDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    sku: string;

    @IsEnum(raw_material_unit_Enum, { message: 'Unit must be a valid enum value (kg, gm, ml, liter, piece, box)' })
    @IsNotEmpty()
    unit: raw_material_unit_Enum;

    @IsNumber()
    @Min(0, { message: 'Stock cannot be negative' })
    currentStock: number;

    @IsNumber()
    @Min(0)
    reorderLevel: number;

    @IsNumber()
    @Min(0, { message: 'Price cannot be negative' })
    pricePerUnit: number;

    @IsMongoId({ message: 'Invalid Category ID format' })
    @IsOptional()
    categoryId?: string;

}
export class UpdateRawMaterialDto extends PartialType(CreateRawMaterialDto) { }


export class rawMaterialFilterDto {
    @ApiPropertyOptional({ description: 'The page number for pagination', example: 1 })
    @IsOptional()
    @Type(() => Number) 
    @IsNumber()
    @Min(1)
    page?: number;

    @ApiPropertyOptional({ description: 'How many records to return per page', example: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number;

    @ApiPropertyOptional({ description: 'Search by Category name or email', example: 'John' })
    @IsOptional()
    @IsString()
    search?: string;
}