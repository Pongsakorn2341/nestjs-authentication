import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import { loggerInstance } from './common/config/winston.logger';
import { AllExceptionsFilter } from './common/exception/all-exception.filter';
const DEFAULT_VERSION = '1';
const prefix = 'api';
const swaggerDocument = `api-documents`;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
    logger: WinstonModule.createLogger({
      instance: loggerInstance,
    }),
  });

  const port = process.env.PORT ?? 3456;

  const httpAdapter = app.get(HttpAdapterHost);
  app.setGlobalPrefix(prefix);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: DEFAULT_VERSION,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  const baseEndPoint = process.env.BASE_ENDPOINT;
  const logger = new Logger(AppModule.name);
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

  await app.listen(port);

  logger.verbose(
    `Api Documents is started at : [${baseEndPoint}/${swaggerDocument}]`,
  );
  logger.verbose(`Server is started at [${baseEndPoint}/${prefix}/v1]`);
  logger.verbose(`--- Gracefully started ! ---`);
}
bootstrap();
