import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client', () => {
  const actualPrisma = jest.requireActual('@prisma/client');
  return {
    ...actualPrisma,
    PrismaClient: jest.fn().mockImplementation(() => ({
      $connect: jest.fn(),
      $disconnect: jest.fn(),
    })),
  };
});

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // describe('onModuleInit', () => {
  //   it('should call $connect', async () => {
  //     const connectSpy = jest.spyOn(service, '$connect');
  //     await service.onModuleInit();
  //     expect(connectSpy).toHaveBeenCalled();
  //   });
  // });

  // describe('onModuleDestroy', () => {
  //   it('should call $disconnect', async () => {
  //     const disconnectSpy = jest.spyOn(service, '$disconnect');
  //     await service.onModuleDestroy();
  //     expect(disconnectSpy).toHaveBeenCalled();
  //   });
  // });
});
