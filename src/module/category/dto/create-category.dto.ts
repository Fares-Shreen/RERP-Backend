import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, MinLength, Min, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from 'node_modules/@nestjs/swagger/dist/decorators/api-property.decorator';

export class CreateCategoryDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3, { message: 'Category name must be at least 3 characters long' })
    name: string;

    @IsString()
    @IsOptional()
    description?: string;
}

export class CategoryFilterDto {
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