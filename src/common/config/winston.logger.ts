import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import * as winston from 'winston';
import { createLogger } from 'winston';
import 'winston-daily-rotate-file';
const customFilter = winston.format((info, opts) => {
  if (info.context === 'HttpMiddleware') {
    return info;
  }
  return false;
});
const customFilterWithoutReq = winston.format((info, opts) => {
  if (info.context === 'HttpMiddleware') {
    return false;
  }
  return info;
});
export const loggerInstance = createLogger({
  transports: [
    new winston.transports.Console({
      level: 'silly',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        nestWinstonModuleUtilities.format.nestLike('Voxxy', {
          colors: true,
          prettyPrint: true,
        }),
      ),
    }),
    new winston.transports.DailyRotateFile({
      level: 'silly',
      filename: 'combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD-HH',
      dirname: 'logs/combined',
      zippedArchive: true,
      maxSize: '20m',
      format: winston.format.combine(
        customFilterWithoutReq(),
        winston.format.timestamp(),
        winston.format.ms(),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json(),
      ),
    }),
    new winston.transports.DailyRotateFile({
      level: 'error',
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD-HH',
      dirname: 'logs/error',
      zippedArchive: true,
      maxSize: '20m',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json(),
      ),
    }),
    new winston.transports.DailyRotateFile({
      level: 'silly',
      filename: 'request-%DATE%.log',
      dirname: 'logs/request',
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      maxSize: '20m',
      format: winston.format.combine(
        customFilter(), // Apply the custom filter
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
});
