import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Employee } from "./employee.model";

@Schema(
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        strictQuery: true
    }
)
export class Category {
    @Prop({
        required: true,
        unique: true,
        trim: true
    })
    name: string;

    @Prop({
        required: false,
        trim: true
    })
    description?: string;

    @Prop({ type: Types.ObjectId, ref: Employee.name, required: true })
    createdBy: Types.ObjectId;

    @Prop({ default: false })
    isDeleted: boolean;

    @Prop({ type: Date, default: null })
    deleteAt?: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.virtual('rawMaterials', {
    ref: 'RawMaterial',
    localField: '_id',
    foreignField: 'categoryId',
});
CategorySchema.pre(["find", "findOne", "findOneAndUpdate"], function () {
    if (!this.getOptions().ignoreSoftDelete) {
        this.where({ isDeleted: false, deleteAt: null });
    }
});

export type HydratedCategoryDoc = HydratedDocument<Category>;
export const CategoryModel = MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }]);