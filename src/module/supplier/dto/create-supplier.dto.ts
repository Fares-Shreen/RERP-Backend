import { Type } from 'class-transformer';
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsEmail,
    Matches,
    Min,
    IsNumber,
    IsMongoId,
    IsArray
} from 'class-validator';
import { ApiPropertyOptional } from 'node_modules/@nestjs/swagger/dist/decorators/api-property.decorator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateSupplierDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^(?:\+20|0)1[0125]\d{8}$/, {
        message: 'Phone number must be a valid Egyptian mobile number (e.g., 01012345678 or +20123456789)'
    })
    phoneNumber: string;

    @IsEmail({}, { message: 'Invalid email format' })
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    companyName?: string;

    @IsString()
    @IsOptional()
    taxId?: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsOptional()
    notes?: string;

    @IsArray()
    @IsMongoId({ each: true, message: 'Each raw material ID must be a valid MongoDB ObjectId' })
    @IsNotEmpty()
    rawMaterialsIds: string[];
}

export class SupplierFilterDto {
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

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) { }
