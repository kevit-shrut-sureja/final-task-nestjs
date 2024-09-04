import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ROLE, RoleType } from '../constants';
import { hash } from 'bcrypt';

@Schema({ timestamps: true })
export class User {
    @Prop({ type: String, required: true, trim: true })
    name: string;

    @Prop({ type: String, required: true, unique: true, trim: true, lowercase: true })
    email: string;

    @Prop({ type: String, required: true, minlength: 7, trim: true })
    password: string;

    @Prop({ type: String, required: true, enum: ROLE })
    role: RoleType;

    @Prop([String])
    tokens?: string[];

    @Prop({ type: Types.ObjectId, ref: 'Branch' })
    branchId?: Types.ObjectId;

    @Prop({ type: String })
    branchName?: string;

    @Prop({ type: String })
    phone?: string;

    @Prop({ type: Number })
    batch?: number;

    @Prop({ type: Number })
    currentSemester?: number;
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserDocument = HydratedDocument<User>;

// Pre-Hook to save the hashed password
UserSchema.pre<UserDocument>('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await hash(this.password, 13);
    }
    next();
});
