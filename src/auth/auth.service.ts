import {
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/interface/user.interface';
import { Role } from '../users/schema/users.schema';
export interface payload {
  type?: string;
  user_email: string;
  sub: string;
  role: Role;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  async hashPassword(password: string): Promise<string> {
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(password, saltOrRounds);

    return hash;
  }

  async validateUser(user_name: string, pass: string): Promise<any> {
    const user = (await this.userService.findUserByEmail(user_name))[0];

    if (user && bcrypt.compareSync(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
  generateAccessToken(payload: payload): string {
    payload.type = 'access';
    const expires_in = Number(
      this.configService.get<number>('JWT_ACCESS_TOKEN_EXPIRED_IN_SEC'),
    );
    const options = {
      expiresIn: expires_in,
    };

    const token = this.jwtService.sign(payload, options);

    return token;
  }
  generateRefreshToken(payload: payload): string {
    payload.type = 'refresh';
    const expires_in = Number(
      this.configService.get<number>('JWT_REFRESH_TOKEN_EXPIRED_IN_SEC'),
    );
    const options = {
      expiresIn: expires_in,
    };

    const token = this.jwtService.sign(payload, options);
    return token;
  }

  async login(user: User): Promise<any> {
    const payload = { user_email: user.email, sub: user.id, role: user.role };
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      access_token: {
        token: accessToken,
        expires_in: this.configService.get<number>(
          'JWT_ACCESS_TOKEN_EXPIRED_IN_SEC',
        ),
      },
      refresh_token: {
        token: refreshToken,
        expires_in: this.configService.get<number>(
          'JWT_REFRESH_TOKEN_EXPIRED_IN_SEC',
        ),
      },
    };
  }
  async refreshUser(refreshToken: string) {
    const token: payload = this.jwtService.verify(refreshToken);
    if (token.type !== 'refresh') {
      throw new UnauthorizedException('token is not refresh token');
    }
    const user = (await this.userService.findUserById(token.sub))[0];

    if (!user) {
      throw new UnauthorizedException('user is invalid');
    }

    const payload = {
      user_email: user.email,
      sub: user.id,
      role: user.role,
    };

    const newAccessToken = this.generateAccessToken(payload);
    const newRefreshToken = this.generateRefreshToken(payload);

    return {
      user: user,
      access_token: {
        token: newAccessToken,
        expires_in: this.configService.get('JWT_ACCESS_TOKEN_EXPIRED_IN_SEC'),
      },
      refresh_token: {
        token: newRefreshToken,
        expires_in: this.configService.get('JWT_REFRESH_TOKEN_EXPIRED_IN_SEC'),
      },
    };
  }
}
