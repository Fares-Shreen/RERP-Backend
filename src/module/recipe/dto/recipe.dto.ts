import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsNumber,
    Min,
    IsArray,
    ValidateNested,
    IsMongoId,
    Max
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class IngredientDto {
    @IsMongoId({ message: 'Invalid Raw Material ID format' })
    @IsNotEmpty()
    rawMaterial: string;

    @IsNumber()
    @Min(0.001)
    quantity: number;
}

export class CreateRecipeDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    sku: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsMongoId({ message: 'Invalid Category ID format' })
    @IsNotEmpty()
    categoryId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => IngredientDto) 
    @IsNotEmpty()
    ingredients: IngredientDto[];

    @IsNumber()
    @Min(0)
    sellingPrice: number;

    @IsNumber()
    @Min(0)
    @Max(100, { message: 'Sale percentage cannot exceed 100%' })
    @IsOptional()
    salePercentage?: number;
}
export class recipeFilterDto {
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

export class UpdateRecipeDto extends PartialType(CreateRecipeDto) { }