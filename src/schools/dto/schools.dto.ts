import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateSchoolPageDto {
  id: string;

  admins: string[];

  @ApiProperty({ description: '학교 이름', example: '테스트고등학교' })
  @IsString()
  name: string;

  @ApiProperty({description:'지역 이름',example :"서울특별시"})
  @IsString()
  region_name: string;
}
