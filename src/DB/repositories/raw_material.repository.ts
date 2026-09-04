
import { Model } from "mongoose";
import baseRepository from "./baseRepository";
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { RawMaterial } from "../models/raw_material.model";


@Injectable()
export class RawMaterialRepository extends baseRepository<RawMaterial> {
    constructor(@InjectModel(RawMaterial.name) model: Model<RawMaterial>) {
        super(model);
    }
}



export default RawMaterialRepository;
