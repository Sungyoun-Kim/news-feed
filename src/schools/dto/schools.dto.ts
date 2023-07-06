import { IsString } from 'class-validator';

export class CreateSchoolPageDto {
  id: string;

  admins: string[];

  @IsString()
  name: string;

  @IsString()
  region_name: string;
}
