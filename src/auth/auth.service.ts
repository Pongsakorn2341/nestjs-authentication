import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as moment from 'moment';
import { EnvConfigProps } from 'src/common/config/env.config';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvConfigProps>,
  ) {}

  private readonly jwtSecret =
    this.configService.get<string>(`envConfig.JWT_SECRET`);

  private readonly logger = new Logger(AuthService.name);

  async signIn(signInDto: LoginDto) {
    const userData = await this.prismaService.user.findUnique({
      where: {
        email: signInDto.email,
      },
    });
    this.logger.debug(
      `Sign in user data : ${JSON.stringify(userData, null, 2)}`,
      'signIn',
    );
    if (!userData) throw new NotFoundException();
    const isMatch = await bcrypt.compare(signInDto.password, userData.password);
    if (!isMatch) {
      throw new UnauthorizedException();
    }

    if (!userData.is_active) {
      throw new HttpException(
        `User is not active or unavailable.`,
        HttpStatus.FORBIDDEN,
      );
    }
    const expiresIn = signInDto.is_remember_me ? '1w' : '6h';
    const signOptions = {
      secret: this.jwtSecret,
      expiresIn: expiresIn,
    } as JwtSignOptions;
    const payload = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      image: userData.profile_image,
      created_at: userData.created_at,
      role: userData.role,
    };
    const expiresUnit = expiresIn.replace(/\d/g, '');
    const expiresAt = moment()
      .add(expiresIn.replace(expiresUnit, ''), expiresUnit as any)
      .toDate();
    const accessToken = await this.jwtService.sign(payload, signOptions);

    return {
      access_token: accessToken,
      user: payload,
      expires_at: expiresAt,
    };
  }

  async register(registerDto: RegisterDto) {
    const isExist = await this.prismaService.user.findFirst({
      where: {
        email: registerDto.email,
      },
    });
    if (isExist) {
      throw new HttpException(
        `User record is already exists.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const hash = await bcrypt.hash(registerDto.password, 10);
    const userData = await this.prismaService.user.create({
      data: {
        email: registerDto.email,
        name: registerDto.name,
        password: hash,
      },
      select: {
        id: true,
        is_active: true,
        email: true,
        name: true,
      },
    });

    return { status: true, userData };
  }
}
