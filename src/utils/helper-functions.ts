import { Types } from 'mongoose';

/**
 * Helper Funciton
 */
export function getObjectID(id?: string) {
    if (id) return new Types.ObjectId(id);
    return new Types.ObjectId();
}

export function getDate(date: string) {
    return new Date(date);
}
