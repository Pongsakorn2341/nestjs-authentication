import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { envConfigObject } from './common/config/env.confgi';
import { JoiValidation } from './common/config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [envConfigObject],
      cache: true,
      isGlobal: true,
      validationSchema: JoiValidation,
      validationOptions: {
        abortEarly: false,
        debug: true,
        stack: true,
      },
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
