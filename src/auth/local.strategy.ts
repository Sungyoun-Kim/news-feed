import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(user_email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(user_email, password);

    if (!user) {
      throw new UnauthorizedException('id or password is incorrect');
    }
    return user;
  }
}
