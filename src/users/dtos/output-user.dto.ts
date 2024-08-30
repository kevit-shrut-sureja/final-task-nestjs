import { Expose } from "class-transformer";
import { RoleType } from "src/constants/role.constants";

export class OutputUserDTO {
    @Expose()
    name : string;
    
    @Expose()
    email : string;

    @Expose()
    role : RoleType

    @Expose()
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