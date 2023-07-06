import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { CreateSchoolPageDto } from './dto/schools.dto';
import { Request, Response } from 'express';

@Controller('schools')
export class SchoolsController {
  constructor(private readonly schoolService: SchoolsService) {}

  @Post()
  async createSchoolPage(
    @Req() req: Request,
    @Body() createSchoolPageDto: CreateSchoolPageDto,
    @Res() res: Response,
  ) {
    const region = await this.schoolService.findRegion(
      createSchoolPageDto.region_name,
    );

    if (!region[0]) {
      throw new BadRequestException('region does not exist');
    }

    await this.schoolService.createSchoolPage(req.user.id, createSchoolPageDto);

    res.status(HttpStatus.CREATED).json('create school page successfully');
  }
}
