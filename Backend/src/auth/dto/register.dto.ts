import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const trimString = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class RegisterDto {
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @Transform(trimString)
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  @Matches(/[a-z]/, { message: 'password must include a lowercase letter' })
  @Matches(/[A-Z]/, { message: 'password must include an uppercase letter' })
  @Matches(/\d/, { message: 'password must include a number' })
  @Matches(/[^A-Za-z0-9]/, {
    message: 'password must include a symbol',
  })
  password!: string;
}
