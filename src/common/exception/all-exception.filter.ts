import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    this.logger.debug('----------------------------------');

    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest<Request>();

    const defaultResponse = {
      cause: null,
      message: (exception as { name: string })?.name || 'Unknown Error',
    };

    let httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (httpStatus === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(exception);
    }

    if (exception instanceof UnauthorizedException) {
      this.logger.warn(`UnAuthorized Exception`);
      httpStatus = HttpStatus.UNAUTHORIZED;
      this.handleUnauthorizedException(exception, defaultResponse);
    } else if (exception instanceof HttpException) {
      this.logger.warn(`Http Exception`);
      this.handleHttpException(exception, request, defaultResponse);
      httpStatus = (exception as any).status || httpStatus;
    }

    if (httpStatus !== HttpStatus.NOT_FOUND) {
      this.logger.debug(exception);
      this.logger.debug(`Cause: ${defaultResponse.cause}`);
      this.logger.debug(`[${httpStatus}] Message: ${defaultResponse.cause}`);
    }

    if (
      typeof defaultResponse.cause === 'string' &&
      defaultResponse.cause.includes('this.prisma.')
    ) {
      defaultResponse.cause = 'Prisma Client Error';
    }

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(request),
      ...defaultResponse,
    };

    httpAdapter.reply(response, responseBody, httpStatus);
  }

  private handleUnauthorizedException(
    exception: UnauthorizedException,
    defaultResponse: any,
  ) {
    const response = exception.getResponse() as any;
    if (typeof response === 'object') {
      defaultResponse.cause = exception.name;
      defaultResponse.message = response.message;
    } else {
      defaultResponse.message = response;
    }
  }

  private handleHttpException(
    exception: HttpException,
    request: Request,
    defaultResponse: any,
  ) {
    const response = exception.getResponse() as any;
    if (
      response instanceof Object &&
      'message' in response &&
      Array.isArray(response.message)
    ) {
      defaultResponse.cause = response.message.join(',');
      defaultResponse.message = 'Bad Request';
    } else {
      defaultResponse.cause =
        typeof response === 'string' ? response : response.message;
      defaultResponse.message = exception.name;
    }

    this.logger.debug(`${request.method}: ${request.url}`);
  }
}
