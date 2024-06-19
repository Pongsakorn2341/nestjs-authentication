import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';
import {
  NotFoundException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
            },
            $transaction: jest.fn((callback) =>
              callback({ user: { create: jest.fn() } }),
            ),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('testSecret'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('signIn', () => {
    it('should throw NotFoundException if user is not found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      const signInDto: LoginDto = {
        email: 'test@test.com',
        password: 'test',
        is_remember_me: false,
      };
      await expect(service.signIn(signInDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const user = { email: 'test@test.com', password: 'hashedPassword' };
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const signInDto: LoginDto = {
        email: 'test@test.com',
        password: 'test',
        is_remember_me: false,
      };
      await expect(service.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw HttpException if user is not active', async () => {
      const user = {
        email: 'test@test.com',
        password: 'hashedPassword',
        is_active: false,
      };
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const signInDto: LoginDto = {
        email: 'test@test.com',
        password: 'test',
        is_remember_me: false,
      };
      await expect(service.signIn(signInDto)).rejects.toThrow(
        new HttpException(
          'User is not active or unavailable.',
          HttpStatus.FORBIDDEN,
        ),
      );
    });

    it('should return access token and user data if credentials are valid', async () => {
      const user = {
        id: 1,
        email: 'test@test.com',
        password: 'hashedPassword',
        is_active: true,
        name: 'Test',
        profile_image: '',
        created_at: new Date(),
        role: 'user',
      };
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      (jwtService.sign as jest.Mock).mockReturnValue('accessToken');

      const signInDto: LoginDto = {
        email: 'test@test.com',
        password: 'test',
        is_remember_me: false,
      };
      const result = await service.signIn(signInDto);

      expect(result).toEqual({
        access_token: 'accessToken',
        user: {
          id: 1,
          name: 'Test',
          email: 'test@test.com',
          image: '',
          created_at: user.created_at,
          role: 'user',
        },
        expires_at: expect.any(Date),
      });
    });
  });

  describe('register', () => {
    it('should throw HttpException if user already exists', async () => {
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue(true);

      const registerDto: RegisterDto = {
        email: 'test@test.com',
        password: 'test',
        name: 'Test',
      };
      await expect(service.register(registerDto)).rejects.toThrow(
        new HttpException(
          'User record is already exists.',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should create a new user and return user data', async () => {
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue(false);
      const createdUser = {
        id: 1,
        email: 'test@test.com',
        is_active: true,
        name: 'Test',
      };
      (prismaService.user.create as jest.Mock).mockResolvedValue(createdUser);

      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');

      const registerDto: RegisterDto = {
        email: 'test@test.com',
        password: 'test',
        name: 'Test',
      };
      const result = await service.register(registerDto);

      expect(result).toEqual({ status: true, userData: createdUser });
    });
  });
});
