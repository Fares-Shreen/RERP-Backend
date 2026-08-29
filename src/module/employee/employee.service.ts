import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { hydartedEmployeeDoc } from 'src/DB/models/employee.model';
import EmployeeRepository from 'src/DB/repositories/employee.repository';
import { Hash_Function } from 'src/common/utils/security/hashing/hash.security';
import { CreateEmployeeDto, EmployeeFilterDto, UpdateEmployeeDto } from './dto/employee.dto';
import { Types } from 'mongoose';

@Injectable()
export class EmployeeService {
  constructor(private readonly employeeRepository: EmployeeRepository) {}
  private readonly logger = new Logger(EmployeeService.name);
  async create(adminId: Types.ObjectId, createEmployeeData: CreateEmployeeDto) {
    this.logger.log(`Creating employee with email: ${createEmployeeData.email}`);
    const email_exist = await this.employeeRepository.exists({email:createEmployeeData.email})
    if (email_exist) {
      this.logger.warn(`Failed to create employee. Email ${createEmployeeData.email} is already taken.`);
      throw new ConflictException("This employee already exist")
    }
    const hashed_password = Hash_Function({plainText:createEmployeeData.password})
    const employee_data = await this.employeeRepository.create({
      ...createEmployeeData, 
      password: hashed_password, 
      salary: createEmployeeData.salary || 0,
      createdBy: adminId ? new Types.ObjectId(adminId) : undefined
    })
    return employee_data;
  }

  async findAll(Query: EmployeeFilterDto) {
    const { page = 1, limit = 10, search } = Query;

    const employees_data = await this.employeeRepository.pagination({
      page, limit, search: search ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ],
      } : { } });

    return employees_data;
  }

  async findOne(id: string) {
    
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid employee ID format.');
    }

    const employee = await this.employeeRepository.findOne({
      filter: { _id: new Types.ObjectId(id)}
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found.`);
    }

    return employee;
  }

  async update(id: string , updateEmployeeData: UpdateEmployeeDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid employee ID format.');
    }
    const objectId = new Types.ObjectId(id);

    const employee = await this.employeeRepository.findOne({
      filter: { _id: objectId }
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found.`);
    }
    if (updateEmployeeData.email && updateEmployeeData.email !== employee.email) {
      const emailExists = await this.employeeRepository.exists({
        email: updateEmployeeData.email,
        _id: { $ne: objectId } 
      });

      if (emailExists) {
        throw new ConflictException('This email is already in use by another employee.');
      }
    }

    if (updateEmployeeData.password) {
      updateEmployeeData.password =  Hash_Function({ plainText: updateEmployeeData.password });
    }

    const employee_data = await this.employeeRepository.findOneAndUpdate({
      filter: { _id: new Types.ObjectId(id) },
      update: { $set: updateEmployeeData }
    });

    return employee_data;
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid employee ID format.');
    }
    const objectId = new Types.ObjectId(id);
    const employee = await this.employeeRepository.findOne({
      filter: { _id: objectId }
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found.`);
    }
    const deletedEmployee = await this.employeeRepository.softDelete({ _id: objectId });
    return {
      message: `Employee with ID ${id} has been securely removed.`,
      employee: deletedEmployee
    };
  }

  
}
