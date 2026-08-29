import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';
export class RegisterDeviceDto { @IsString() @MinLength(1) @MaxLength(512) pushToken!:string; @IsIn(['android','ios','web']) platform!: 'android'|'ios'|'web'; }
