import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Branch {
    @Prop({ type: String, required: true, trim: true })
    name: string;

    @Prop({ type: String })
    description?: string;

    @Prop({ type: Number, required: true })
    batch: number;

    @Prop({ type: Number, required: true })
    totalStudentsIntake: number;
}

export const BranchSchema = SchemaFactory.createForClass(Branch);
// creating branch index
BranchSchema.index({ name: 1, batch: 1 }, { unique: true });

export type BranchDocument = HydratedDocument<Branch>;
