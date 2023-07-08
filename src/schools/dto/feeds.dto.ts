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
