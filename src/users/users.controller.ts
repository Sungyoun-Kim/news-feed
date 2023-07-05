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

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @AllowUnauthorizedRequest()
  @Post('sign-up')
  async signUpUser(@Body() signUpUserDto: SignUpUserDto, @Res() res: Response) {
    const user = await this.userService.findUserByEmail(signUpUserDto.email);
    if (user[0]) {
      throw new BadRequestException('email already exist');
    }

    await this.userService.signUpUser(signUpUserDto);

    res.status(HttpStatus.CREATED).json('user has been signed up');
  }
}
