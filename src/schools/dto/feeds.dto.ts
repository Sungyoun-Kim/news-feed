import { IsOptional, IsString } from 'class-validator';
import { School } from '../interface/schools.interface';

export class CreateSchoolFeedDto {
  id: string;
  school: School;

  @IsString()
  subject: string;

  @IsString()
  content: string;
}

export class UpdateSchoolFeedDto {
  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  content?: string;
}
