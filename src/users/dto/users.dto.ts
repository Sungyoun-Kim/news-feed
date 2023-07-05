import { IsEmail, IsEnum, IsString } from 'class-validator';

import { Role } from '../schema/users.schema';

export class SignUpUserDto {
  id: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsEnum(Role)
  role: number;
}
