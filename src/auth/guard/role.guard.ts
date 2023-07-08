import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { Role } from 'src/users/schema/users.schema';

export const RoleLevel = (roleLevel: Role) =>
  SetMetadata('roleLevel', roleLevel);

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const allowUnauthorizedRequest = this.reflector.get<boolean>(
      'allowUnauthorizedRequest',
      context.getHandler(),
    );

    if (allowUnauthorizedRequest) {
      return true;
    }
    // API에 설정된 roleLevel 가져오기
    const roleLevel = this.reflector.get<Role>(
      'roleLevel',
      context.getHandler(),
    );
    const req: Express.Request = context.switchToHttp().getRequest();
    const { user } = req;

    if (user.role >= roleLevel) {
      return true;
    } else {
      throw new ForbiddenException('insufficient permission');
    }
  }
}
