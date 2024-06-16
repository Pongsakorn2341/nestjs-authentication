import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { EUserRole } from '@prisma/client';

export type IUserJwt = {
  id: string;
  email: string;
  created_at: string;
  role: EUserRole;
  iat: number;
  exp: number;
  instance_id: string;
  instance_url: string;
};

export const CurrentUser = createParamDecorator(
  (data: string, context: ExecutionContext): IUserJwt => {
    const request = context.switchToHttp().getRequest();
    const result = data ? request.user?.[data] : (request.user as IUserJwt);
    if (result && new Date() > new Date(result.exp * 1000)) {
      throw new HttpException(
        `Authorization is expired`,
        HttpStatus.UNAUTHORIZED,
      );
    }
    return result;
  },
);
