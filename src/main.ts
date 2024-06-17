import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import { loggerInstance } from './common/config/winston.logger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
    logger: WinstonModule.createLogger({
      instance: loggerInstance,
    }),
  });
  const baseEndPoint = process.env.BASE_ENDPOINT;
  const logger = new Logger(AppModule.name);

  const swaggerDocument = `api-documents`;
  const prefix = 'api';
  const config = new DocumentBuilder()
    .setTitle('Authentication')
    .setDescription('Startup jwt based authentication in Nest.js')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerDocument, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
    },
  });

  await app.listen(3000);

  logger.verbose(
    `Api Documents is started at : [${baseEndPoint}/${swaggerDocument}]`,
  );
  logger.verbose(`Server is started at [${baseEndPoint}/${prefix}/v1]`);
  logger.verbose(`--- Gracefully started ! ---`);
}
bootstrap();
