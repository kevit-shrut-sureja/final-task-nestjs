import { registerDecorator, ValidationOptions } from 'class-validator';
import { Types } from 'mongoose';

export function IsValidObjectID(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'IsValidObjectID',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    // checking if it is a valid objectID or is empty (to allow optional fields)
                    return Types.ObjectId.isValid(value) || !value;
                },
                defaultMessage() {
                    return 'Invalid MongoID';
                },
            },
        });
    };
}
