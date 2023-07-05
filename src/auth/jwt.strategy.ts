import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Express.Request) => request.cookies.access_token.token,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET_KEY'),
      passReqToCallBack: true,
    });
  }

  async validate(payload: any) {
    if (!payload.type || payload.type !== 'access') {
      throw new UnauthorizedException(
        'token does not have type or type is not access token',
      );
    }

    const user = (await this.userService.findUserById(payload.sub))[0];

    if (!user) {
      throw new UnauthorizedException('user information in payload is invalid');
    }

    return user;
  }
}
