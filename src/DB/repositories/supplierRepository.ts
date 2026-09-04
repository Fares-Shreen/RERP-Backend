
import { Model } from "mongoose";
import baseRepository from "./baseRepository";
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Supplier } from "../models/supplier.model";

@Injectable()
export class SupplierRepository extends baseRepository<Supplier> {
    constructor(@InjectModel(Supplier.name) model: Model<Supplier>) {
        super(model);
    }
}



export default SupplierRepository;
