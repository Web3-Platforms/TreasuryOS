import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid institutional email address' })
  email!: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(1)
  password!: string;
}
