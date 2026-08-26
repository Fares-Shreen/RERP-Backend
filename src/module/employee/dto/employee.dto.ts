import {
    IsString,
    IsNotEmpty,
    IsEmail,
    MinLength,
    IsEnum,
    IsOptional,
    IsNumber,
    IsPositive,
    Min
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
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

    @ApiProperty({ example: '+01234567890', description: 'Contact phone number' })
    @IsString()
    @IsNotEmpty()
    phone: string;

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