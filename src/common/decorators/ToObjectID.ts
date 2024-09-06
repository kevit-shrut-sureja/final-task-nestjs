import { Transform } from "class-transformer";
import { Types } from "mongoose";

export function TransformObjectID(){
    return Transform(({value}) => { 
        if(typeof value === "string" && Types.ObjectId.isValid(value)){
            return new Types.ObjectId(value)
        }
        return value
    }, {toClassOnly : true})
}