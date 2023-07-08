import { IsEmail, IsEnum, IsString } from 'class-validator';

import { Role } from '../schema/users.schema';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpUserDto {
  id: string;

  @ApiProperty({
    description: '가입하고자 하는 이메일',
    example: 'test2@email.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '가입하고자 하는 비밀번호',
    example: '1234',
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: '가입하고자 하는 유저의 역할',
    enum: Role,
  })
  @IsEnum(Role)
  role: number;
}
