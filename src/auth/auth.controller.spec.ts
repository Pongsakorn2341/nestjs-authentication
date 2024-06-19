import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const mockAuthService = {
      signIn: jest.fn(),
      register: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('signIn', () => {
    it('should call authService.signIn with the correct parameters', async () => {
      const signInDto: LoginDto = {
        email: 'test@test.com',
        password: 'test',
        is_remember_me: false,
      };
      const result = { access_token: 'token', user: {} };

      (authService.signIn as jest.Mock).mockResolvedValue(result);

      expect(await authController.signIn(signInDto)).toBe(result);
      expect(authService.signIn).toHaveBeenCalledWith(signInDto);
    });
  });

  describe('register', () => {
    it('should call authService.register with the correct parameters', async () => {
      const registerDto: RegisterDto = {
        email: 'test@test.com',
        password: 'test',
        name: 'Test',
      };
      const result = { status: true, userData: {} };

      (authService.register as jest.Mock).mockResolvedValue(result);

      expect(await authController.register(registerDto)).toBe(result);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });
});
