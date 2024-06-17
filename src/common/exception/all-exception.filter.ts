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
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    this.logger.debug(`----------------------------------`);

    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const rest = {
      cause: null,
      message: (exception as { name: string })?.name || 'Unknwon Error',
    };

    let httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (httpStatus == HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(exception);
    }

    if (exception instanceof UnauthorizedException) {
      httpStatus = HttpStatus.UNAUTHORIZED;
      const response = exception.getResponse() as any;
      if (typeof response === 'object') {
        rest.cause = exception.name;
        rest.message = response.message;
      } else {
        rest.message = response;
      }
    } else if (exception instanceof HttpException) {
      const request = ctx.getRequest<Request>();
      const response = exception.getResponse() as {
        message: string;
        error: string;
        statusCode: number;
      };
      if (response.statusCode !== 404) {
        this.logger.error(
          `${request.method}: ${request.url} - ${response.statusCode}`,
          null,
          'AllExceptionsFilter',
        );
        this.logger.error(
          exception.message,
          exception.stack,
          'AllExceptionsFilter',
        );
      }
      const exceptionResponse = exception.getResponse();
      if (
        exceptionResponse instanceof Object &&
        'message' in exceptionResponse &&
        Array.isArray(exceptionResponse.message)
      ) {
        rest.cause = exceptionResponse.message.join(',');
        rest.message = 'Bad Request';
      } else {
        rest.cause =
          typeof (exception as any).response == 'string'
            ? (exception as any).response
            : (exception as any).response.message;
        rest.message = (exception as any).name;
        httpStatus = (exception as any).status as number | 0;
      }
      this.logger.debug(`${request.method}: ${request.url}`);
    } else {
      //   const result = handleError(exception);
      //   rest.cause = result.cause ? result.cause : exception;
      //   rest.message = result.message ? result.message : (exception as string);
      //   httpStatus = result.code;
    }
    if (httpStatus != 404) {
      this.logger.debug(exception);
      this.logger.debug(`Cause : ${rest.cause}`);
      this.logger.debug(`[${httpStatus}] Message : ${rest.cause}`);
    }

    if (typeof rest.cause == 'string' && rest.cause.includes('this.prisma.')) {
      rest.cause = 'Prisma Error';
    }

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
