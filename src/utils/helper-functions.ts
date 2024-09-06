import { Types } from "mongoose";

/**
 * Helper Funciton
 */
export function getObjectID(id: string) {
    return new Types.ObjectId(id);
}

export function getDate(date: string) {
    return new Date(date);
}

export function getNewObjectID(){
    return new Types.ObjectId()
}