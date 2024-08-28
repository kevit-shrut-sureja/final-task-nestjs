import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ROLE } from 'src/constants/role.constant';
import { hash } from 'bcrypt'


@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ required: true, unique: true, trim: true, lowercase: true })
    email: string;

    @Prop({ required: true, minlength: 7, trim: true })
    password: string;

    @Prop({ required: true, enum: ROLE })
    role: string;

    @Prop([String])
    tokens?: string[];

    @Prop({
        type: {
            branchId: { type: String, ref: 'Branch' },
            branchName : String,
            phone : String,
            batch : Number,
            currentSemester : Number
        },
        _id : false
    })
    userDetails?: Record<string, any>;
}

export const UserSchema = SchemaFactory.createForClass(User)

export type UserDocument = HydratedDocument<User>

// Pre-Hook to save the hashed password
UserSchema.pre<UserDocument>('save',async function (next){
    if (this.isModified('password')) {
        this.password = await hash(this.password, 13);
    }
    next();
})