import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Employee } from "./employee.model";
import { RawMaterial } from "./raw_material.model";
import { Supplier } from "./supplier.model";
import { transaction_type_Enum } from "src/common/enums/inventory.enum"; 

@Schema(
    {
        timestamps: true, 
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        strictQuery: true
    }
)
export class Inventory {
    @Prop({ type: Types.ObjectId, ref: RawMaterial.name, required: true })
    rawMaterialId: Types.ObjectId;

    @Prop({ type: String, enum: transaction_type_Enum, required: true })
    type: transaction_type_Enum;

    @Prop({ type: Number, required: true })
    quantityChanged: number;

    @Prop({ type: Number, required: true })
    previousStock: number;

    @Prop({ type: Number, required: true })
    newStock: number;

    @Prop({ type: Types.ObjectId, ref: Supplier.name, required: false })
    supplierId?: Types.ObjectId;

    @Prop({ type: String, required: false, trim: true })
    notes?: string;

    @Prop({ type: Types.ObjectId, ref: Employee.name, required: true })
    createdBy: Types.ObjectId;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);

InventorySchema.virtual("rawMaterial", {
    ref: RawMaterial.name,
    localField: "rawMaterialId",
    foreignField: "_id",
    justOne: true,
});

InventorySchema.virtual("supplier", {
    ref: Supplier.name,
    localField: "supplierId",
    foreignField: "_id",
    justOne: true,
});

export type HydratedInventoryDoc = HydratedDocument<Inventory>;
export const InventoryModel = MongooseModule.forFeature([{ name: Inventory.name, schema: InventorySchema }]);