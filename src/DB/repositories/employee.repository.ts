
import { Model } from "mongoose";
import baseRepository from "./baseRepository";
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Employee } from "../models/employee.model";


@Injectable()
export class EmployeeRepository extends baseRepository<Employee> {
    constructor(@InjectModel(Employee.name) model: Model<Employee>) {
        super(model);
    }
}



export default EmployeeRepository;
