import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Attendance {
    @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
    studentId: Types.ObjectId;

    @Prop({ type: Date, required: true })
    date: Date;

    @Prop({ type: Boolean, default: false })
    present: boolean = false;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
AttendanceSchema.index({ studentId : 1, date : 1}, { unique : true })

export type AttendanceDocument = HydratedDocument<Attendance>;