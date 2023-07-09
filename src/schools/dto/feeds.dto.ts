import { IsOptional, IsString } from 'class-validator';
import { School } from '../interface/schools.interface';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSchoolFeedDto {
  id: string;
  school: School;

  @ApiProperty({ description: '제목', example: '페이지 생성 후 첫 소식' })
  @IsString()
  subject: string;

  @ApiProperty({ description: '내용', example: '페이지 생성 후 첫 소식이에요' })
  @IsString()
  content: string;
}

export class UpdateSchoolFeedDto {
  @ApiProperty({
    description: '제목',
    example: '수정하고싶은 제목',
  })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({
    description: '내용',
    example: '수정하고싶은 내용',
  })
  @IsOptional()
  @IsString()
  content?: string;
}

export class GetSchoolFeedResponseDto {
  @ApiProperty({
    description: 'id',
    example: '196d8503-7ab9-42c7-a30d-dfcff55d9034',
  })
  id: string;

  @ApiProperty({
    description: '제목',
    example: '페이지 생성 후 첫 소식 제목',
  })
  subject: string;

  @ApiProperty({
    description: 'id',
    example: '페이지 생성 후 첫 소식내용입니다',
  })
  content: string;

  @ApiProperty({
    description: '학교 정보',
    example: {
      name: '1234',
      id: '762c9664-a2fe-4f7f-b0e8-2c1babfb07ad',
    },
  })
  school: School;

  @ApiProperty({
    description: '생성 시간',
    example: '2023-07-09T07:55:25.549Z',
  })
  created_at: string;
}
