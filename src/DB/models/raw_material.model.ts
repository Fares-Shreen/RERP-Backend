import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { raw_material_unit_Enum } from "src/common/enums/raw_material.enum";
import { Category } from "./category.model";
import { Employee } from "./employee.model";
import { Supplier } from "./supplier.model";





@Schema(
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        strictQuery: true
    }
)
export class RawMaterial {
    @Prop({ type: String, required: true, trim: true, unique: true })
    name: string

    @Prop({ type: String, required: true, trim: true, unique: true })
    sku: string

    @Prop({ type: String, required: true, trim: true, enum: raw_material_unit_Enum })
    unit: raw_material_unit_Enum

    @Prop({ type: Number, required: true, trim: true })
    currentStock: number

    @Prop({ type: Number, required: true, trim: true })
    reorderLevel: number

    @Prop({ type: Number, required: true, trim: true })
    pricePerUnit: number

    @Prop({ type: Types.ObjectId, ref: Category.name, required: false })
    categoryId: Types.ObjectId

    @Prop({ type: Types.ObjectId, ref: Supplier.name, required: false })
    supplierId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: Employee.name, required: true })
    createdBy: Types.ObjectId;

    @Prop({ default: false })
    isDeleted: boolean;

    @Prop({ type: Date, default: null })
    deleteAt?: Date;

}

export const RawMaterialSchema = SchemaFactory.createForClass(RawMaterial);

RawMaterialSchema.virtual('category', {
    ref: 'Category',
    localField: 'categoryId',
    foreignField: '_id',
});

RawMaterialSchema.virtual('supplier', {
    ref: 'Supplier',
    localField: '_id',               
    foreignField: 'rawMaterialsIds', 
    justOne: true                    
});

RawMaterialSchema.pre(["find", "findOne", "findOneAndUpdate"], function () {
    if (!this.getOptions().ignoreSoftDelete) {
        this.where({ isDeleted: false, deleteAt: null });
    }
});

export type hydartedRawMaterialDoc = HydratedDocument<RawMaterial>
export const RawMaterialModel = MongooseModule.forFeature([{ name: RawMaterial.name, schema: RawMaterialSchema }])
