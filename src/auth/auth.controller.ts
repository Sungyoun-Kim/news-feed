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
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginDto, LoginResponseDto } from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({
    summary: '로그인',
    description:
      '- id, password가 매치되는 user에 대한 액세스 토큰 및 리프레쉬 토큰 발급\n' +
      '- 액세스 토큰은 쿠키에 넣어주고, 리프레쉬 토큰은 클라이언트에서 가지고 있다가(로컬 스토리지 등) 필요할 때 사용하는 것으로 가정하였음\n',
  })
  @ApiBody({
    description: '- expires_in: 토큰의 만료까지 남은 시간',
    type: LoginDto,
  })
  @ApiCreatedResponse({ description: '- 로그인 결과 ', type: LoginResponseDto })
  @ApiUnauthorizedResponse({
    description: '- 아이디 또는 비밀번호가 일치하지 않는 경우',
  })
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

  @ApiOperation({
    summary: '액세스 토큰 재발급',
    description: '- 유효한 리프레쉬 토큰에 대하여 액세스토큰을 재발급한다\n',
  })
  @ApiOkResponse({
    description: '- 액세스 토큰 재발급 성공',
    type: LoginResponseDto,
  })
  @ApiUnauthorizedResponse({
    description:
      '- 아이디 또는 비밀번호가 일치하지 않는 경우\n' +
      '- 토큰이 유효하지 않는 경우\n' +
      '- 토큰의 페이로드에 있는 유저의 정보가 유효하지 않은 경우\n',
  })
  @ApiQuery({
    description: '리프레쉬 토큰',
    name: 'token',
  })
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
