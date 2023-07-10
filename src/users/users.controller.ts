import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { SignUpUserDto } from './dto/users.dto';
import { Response } from 'express';
import { AllowUnauthorizedRequest } from '../auth/guard/jwt-auth.guard';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('User')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @ApiOperation({
    summary: '회원가입',
    description:
      '- 동일한 email이 없을 시, email, password를 가진 회원을 생성한다\n',
  })
  @ApiBody({
    description: '- 회원가입시 필요한 데이터',
    type: SignUpUserDto,
  })
  @ApiCreatedResponse({
    description: '- 회원가입 성공 ',
  })
  @ApiBadRequestResponse({
    description:
      '- 이메일이 이미 존재하는 경우\n' + '- 올바르지 못한 값이 전달된 경우',
  })
  @AllowUnauthorizedRequest()
  @Post('sign-up')
  async signUpUser(@Body() signUpUserDto: SignUpUserDto, @Res() res: Response) {
    const user = await this.userService.findUserByEmail(signUpUserDto.email);
    if (user[0]) {
      throw new BadRequestException('email already exist');
    }

    const result = await this.userService.signUpUser(signUpUserDto);

    res.status(HttpStatus.CREATED).json(result);
  }
}
