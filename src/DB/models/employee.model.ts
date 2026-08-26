import { MongooseModule, Prop, Schema, SchemaFactory, Virtual } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { employee_role_Enum } from "src/common/enums/employee.enum";



@Schema(
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        strictQuery: true
    }
)

export class Employee {
    @Prop({
        required: true,
        trim: true
    })
    name: string;

    @Prop({
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    })
    email: string;

    @Prop({
        required: true,
        select: false
    })
    password: string;

    @Prop({ required: true })
    phone: string;

    @Prop({
        type: String,
        enum: employee_role_Enum,
        required: true
    })
    role: employee_role_Enum;

    @Prop({ required: false })
    salary?: number;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ default: false })
    isDeleted: boolean;
    @Prop({ type: Types.ObjectId, ref: Employee.name, required: false })
    createdBy?: Types.ObjectId; // Optional for now, until we lock down Auth
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee)

EmployeeSchema.pre(["find", "findOne", "findOneAndUpdate"], function () {
    this.where({ isDeleted: false, deleteAt: null })
});



export type hydartedEmployeeDoc = HydratedDocument<Employee>
export const EmplyeeModel = MongooseModule.forFeature([{name:Employee.name,schema:EmployeeSchema}])