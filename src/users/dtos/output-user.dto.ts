import { Expose, Transform } from 'class-transformer';
import { Types } from 'mongoose';
import { RoleType } from '../../constants';

export class OutputUserDTO {
    @Expose()
    @Transform(({ obj }) => {
        return obj._id instanceof Types.ObjectId ? obj._id.toHexString() : obj._id;
    })
    _id: string;

    @Expose()
    name: string;

    @Expose()
    email: string;

    @Expose()
    role: RoleType;

    @Expose()
    @Transform(({ obj }) => {
        return obj.branchId instanceof Types.ObjectId ? obj.branchId.toHexString() : obj.branchId;
    })
    branchId?: string;

    @Expose()
    branchName?: string;

    @Expose()
    phone?: string;

    @Expose()
    batch?: number;

    @Expose()
    currentSemester?: number;
}
