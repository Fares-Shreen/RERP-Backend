
import { Model } from "mongoose";
import baseRepository from "./baseRepository";
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Inventory } from "../models/Inventory.model";


@Injectable()
export class InventoryRepository extends baseRepository<Inventory> {
    constructor(@InjectModel(Inventory.name) model: Model<Inventory>) {
        super(model);
    }
}



export default InventoryRepository;
