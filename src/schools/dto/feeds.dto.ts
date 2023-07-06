import { IsString } from 'class-validator';
import { School } from '../interface/schools.interface';

export class CreateSchoolFeedDto {
  id: string;
  school: School;

  @IsString()
  subject: string;

  @IsString()
  content: string;
}
