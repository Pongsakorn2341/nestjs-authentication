import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    required: true,
    type: String,
    default: 'meepanda2341@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ required: true, type: String, default: '123123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ required: false, type: Boolean, default: false })
  @IsBoolean()
  @IsNotEmpty()
  is_remember_me: boolean;
}
