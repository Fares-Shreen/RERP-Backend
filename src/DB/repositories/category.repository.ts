
import { Model } from "mongoose";
import baseRepository from "./baseRepository";
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Category } from "../models/category.model";


@Injectable()
export class CategoryRepository extends baseRepository<Category> {
    constructor(@InjectModel(Category.name) model: Model<Category>) {
        super(model);
    }
}



export default CategoryRepository;
