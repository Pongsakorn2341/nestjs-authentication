import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RequestRegisterDto {
  @ApiProperty({ default: 'meepanda2341@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class RegisterDto {
  @ApiProperty({ type: String, default: 'meepanda2341@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ default: 'Tottee' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ default: '123123' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
