import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Res,
  Get,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AllowUnauthorizedRequest } from './guard/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @AllowUnauthorizedRequest()
  @UseGuards(AuthGuard('local'))
  @Post('/login')
  async login(@Request() req: Express.Request, @Res() res: Response) {
    const loggedInUser = await this.authService.login(req.user);

    res.cookie('access_token', loggedInUser.access_token, {
      httpOnly: true,
      maxAge: this.configService.get('JWT_ACCESS_TOKEN_EXPIRED_IN_SEC'),
    });

    res.status(201).json({ refresh_token: loggedInUser.refresh_token });
  }

  @AllowUnauthorizedRequest()
  @Get('refresh')
  async refreshAccessToken(
    @Query('token') token: string,

    @Res() res: Response,
  ) {
    const refreshedUser = await this.authService.refreshUser(token);

    res.cookie('access_token', refreshedUser.access_token.token, {
      httpOnly: true,
      maxAge: this.configService.get('JWT_ACCESS_TOKEN_EXPIRED_IN_SEC'),
    });

    res.status(200).json({ refresh_token: refreshedUser.refresh_token });
  }
}
