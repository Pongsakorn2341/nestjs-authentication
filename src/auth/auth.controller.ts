import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IgnoreAuth } from '../common/decorators/auth.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller('auth')
@IgnoreAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async signIn(@Body() body: LoginDto) {
    return await this.authService.signIn(body);
  }

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }
}
