import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInUser {
    @IsEmail({}, { message: 'Enter valid email format.' })
    @IsNotEmpty({ message: 'Email is required.' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'Message is required.' })
    password: string;
}
