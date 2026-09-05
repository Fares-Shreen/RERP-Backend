import {
    IsString,
    IsNotEmpty,
    IsEmail,
    MinLength,
    IsEnum,
    IsOptional,
    IsNumber,
    IsPositive,
    Min,
    Matches
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { employee_role_Enum } from 'src/common/enums/employee.enum';
import { Type } from "class-transformer";

export class CreateEmployeeDto {
    @ApiProperty({ example: 'John Doe', description: 'The full name of the employee' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'john.doe@restaurant.com', description: 'A unique email address' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'StrongPass123!', description: 'Must be at least 8 characters' })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^(?:\+20|0)1[0125]\d{8}$/, {
        message: 'Phone number must be a valid Egyptian mobile number (e.g., 01012345678 or +20123456789)'
    })
    phoneNumber: string;

    @ApiProperty({ enum: employee_role_Enum, example: employee_role_Enum.waiter, description: 'Role of the employee in the restaurant' })
    @IsEnum(employee_role_Enum)
    @IsNotEmpty()
    role: employee_role_Enum;

    @ApiPropertyOptional({ example: 4500, description: 'Annual salary or hourly rate' })
    @IsNumber()
    @IsOptional()
    salary?: number;
}

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) { }

export class EmployeeFilterDto {
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

    @ApiPropertyOptional({ description: 'Search by employee name or email', example: 'John' })
    @IsOptional()
    @IsString()
    search?: string;
}