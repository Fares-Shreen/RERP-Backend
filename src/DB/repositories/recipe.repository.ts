
import { Model } from "mongoose";
import baseRepository from "./baseRepository";
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Recipe } from "../models/recipe.model";


@Injectable()
export class RecipeRepository extends baseRepository<Recipe> {
    constructor(@InjectModel(Recipe.name) model: Model<Recipe>) {
        super(model);
    }
}



export default RecipeRepository;
