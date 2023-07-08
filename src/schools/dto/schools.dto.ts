import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateSchoolPageDto {
  id: string;

  admins: string[];

  @ApiProperty({ description: '학교 이름', example: '테스트고등학교' })
  @IsString()
  name: string;

  @ApiProperty({ description: '지역 이름', example: '서울특별시' })
  @IsString()
  region_name: string;
}

export class FindSubscribeSchoolPagesResponseDto {
  @ApiProperty({
    description: '지역 이름',
    example: '경상남도',
  })
  region_name: string;

  @ApiProperty({
    description: 'id',
    example: '82d9823c-6f22-4c33-9f8c-f1c5ffce171b',
  })
  id: string;

  @ApiProperty({
    description: 'id',
    example: '행복고등학교',
  })
  name: string;

  @ApiProperty({
    description: 'id',
    example: ['b7cba70b-78bc-438e-b08b-0679282c15a0'],
  })
  admin: string[];
}
