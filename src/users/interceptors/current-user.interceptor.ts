import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { UsersService } from '../users.service';

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(private usersServise: UsersService) {}

  async intercept(ctx: ExecutionContext, handler: CallHandler) {
    const req = ctx.switchToHttp().getRequest();
    const { userId } = req.session || {};
    if (userId) {
      const user = await this.usersServise.findOne(userId);
      req.currentUser = user;
    }
    return handler.handle();
  }
}
