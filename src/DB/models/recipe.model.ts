import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Employee } from "./employee.model";
import { Category } from "./category.model";
import { RawMaterial } from "./raw_material.model";

@Schema({ _id: false }) 
export class Ingredient {
    @Prop({ type: Types.ObjectId, ref: RawMaterial.name, required: true })
    rawMaterial: Types.ObjectId;

    @Prop({ type: Number, required: true, min: 0.001 }) 
    quantity: number;
}
export const IngredientSchema = SchemaFactory.createForClass(Ingredient);

@Schema(
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        strictQuery: true
    }
)
export class Recipe {
    @Prop({ type: String, required: true, trim: true, unique: true })
    name: string;

    @Prop({ type: String, required: true, trim: true, unique: true })
    sku: string;

    @Prop({ type: String, required: false, trim: true })
    description?: string;

    @Prop({ type: Types.ObjectId, ref: Category.name, required: true })
    categoryId: Types.ObjectId;

    @Prop({ type: [IngredientSchema], required: true })
    ingredients: Ingredient[];

    @Prop({ type: Number, required: true, min: 0 })
    sellingPrice: number;

    @Prop({ type: Number, default: 0, min: 0, max: 100 })
    salePercentage: number;

    @Prop({ type: Number, min: 0 })
    priceAfterDiscount: number;

    @Prop({ type: Number, default: 0 })
    estimatedCost: number;

    @Prop({ type: Types.ObjectId, ref: Employee.name, required: true })
    createdBy: Types.ObjectId;

    @Prop({ default: false })
    isDeleted: boolean;

    @Prop({ type: Date, default: null })
    deleteAt?: Date;
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);

RecipeSchema.pre(["find", "findOne", "findOneAndUpdate"], function () {
    if (!this.getOptions().ignoreSoftDelete) {
        this.where({ isDeleted: false, deleteAt: null });
    }
});
RecipeSchema.pre('save', function () {
    if (this.isModified('sellingPrice') || this.isModified('salePercentage') || this.isNew) {
        const sale = this.salePercentage || 0;
        this.priceAfterDiscount = this.sellingPrice - (this.sellingPrice * (sale / 100));
    }
});
RecipeSchema.pre('findOneAndUpdate', async function () {
    const update = this.getUpdate() as any;
    const setPayload = update.$set || update;
    if (setPayload.sellingPrice !== undefined || setPayload.salePercentage !== undefined) {
        const docToUpdate = await this.model.findOne(this.getQuery());
        if (docToUpdate) {
            const newSellingPrice = setPayload.sellingPrice !== undefined ? setPayload.sellingPrice : docToUpdate.sellingPrice;
            const newSalePercentage = setPayload.salePercentage !== undefined ? setPayload.salePercentage : docToUpdate.salePercentage;
            setPayload.priceAfterDiscount = newSellingPrice - (newSellingPrice * (newSalePercentage / 100));
        }
    }
});

RecipeSchema.virtual('category', {
    ref: 'Category',
    localField: 'categoryId',
    foreignField: '_id',
});

RecipeSchema.virtual("rawMaterials", {
    ref: "RawMaterial",
    localField: "ingredients.rawMaterial",
    foreignField: "_id",
});

export type HydratedRecipeDoc = HydratedDocument<Recipe>;
export const RecipeModel = MongooseModule.forFeature([{ name: Recipe.name, schema: RecipeSchema }]);