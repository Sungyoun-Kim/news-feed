import { IsEmail, IsEnum, IsString } from 'class-validator';

import { Role } from '../schema/users.schema';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpUserDto {
  id: string;

  @ApiProperty({
    description: '가입하고자 하는 이메일',
    example: 'test@email.com',
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

export class SignUpUserResponseDto {
  @ApiProperty({
    description: '이메일',
    example: 'test@email.com',
  })
  email: string;

  @ApiProperty({
    description: '역할',
    example: '200',
  })
  role: Role;

  @ApiProperty({
    description: 'id',
    example: '0333feb3-ccee-4ed8-814c-e6130ca2838c',
  })
  id: string;

  @ApiProperty({
    description: '구독하는 학교 페이지',
    example: [],
  })
  subscribe_schools: string[];
}
