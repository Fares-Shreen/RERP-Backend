import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Employee } from "./employee.model";
import { RawMaterial } from "./raw_material.model";

@Schema(
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        strictQuery: true
    }
)
export class Supplier {
    @Prop({ type: String, required: true, trim: true, unique: true })
    name: string;

    @Prop({ type: String, required: true, trim: true, unique: true })
    phoneNumber: string;

    @Prop({ type: String, required: false, trim: true, unique: true, sparse: true })
    email?: string;

    @Prop({ type: String, required: false, trim: true })
    companyName?: string;

    @Prop({ type: String, required: false, trim: true })
    taxId?: string;

    @Prop({ type: String, required: true, trim: true })
    address: string;

    @Prop({ type: String, required: false, trim: true })
    notes?: string;

    @Prop({ type: [{ type: Types.ObjectId, ref:"RawMaterial"}],required:true})
    rawMaterialsIds?: Types.ObjectId[];

    @Prop({ type: Types.ObjectId, ref:Employee.name, required: true })
    createdBy: Types.ObjectId;

    @Prop({ default: false })
    isDeleted: boolean;

    @Prop({ type: Date, default: null })
    deleteAt?: Date;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);

SupplierSchema.virtual('rawMaterials', {
    ref: 'RawMaterial',
    localField: 'rawMaterialsIds',
    foreignField: '_id',
});


SupplierSchema.pre(["find", "findOne", "findOneAndUpdate"], function () {
    if (!this.getOptions().ignoreSoftDelete) {
        this.where({ isDeleted: false, deleteAt: null });
    }
});

export type HydratedSupplierDoc = HydratedDocument<Supplier>;
export const SupplierModel = MongooseModule.forFeature([{ name: Supplier.name, schema: SupplierSchema }]);