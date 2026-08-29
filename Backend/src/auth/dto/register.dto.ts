import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
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
  @MinLength(6)
  @MaxLength(128)
  password!: string;
}
