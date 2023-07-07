import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { CreateSchoolPageDto } from './dto/schools.dto';
import { Request, Response } from 'express';
import { CreateSchoolFeedDto } from './dto/feeds.dto';

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

  @Post(':id/feeds')
  async createSchoolFeed(
    @Req() req: Request,
    @Param('id') schoolId: string,
    @Body() createSchoolFeedDto: CreateSchoolFeedDto,
    @Res() res: Response,
  ) {
    const school = await this.schoolService.findSchoolById(schoolId);
    if (!school[0]) {
      throw new BadRequestException('school does not exist');
    }
    if (!school[0].admins.includes(req.user.id)) {
      throw new ForbiddenException('no permission');
    }
    createSchoolFeedDto.school = school[0];
    await this.schoolService.createSchoolFeed(createSchoolFeedDto);

    res.status(HttpStatus.CREATED).json('create school feed successfully');
  }

  @Delete(':schoolId/feeds/:feedId')
  async deleteSchoolFeed(
    @Req() req: Request,
    @Param('schoolId') schoolId: string,
    @Param('feedId') feedId: string,
    @Res() res: Response,
  ) {
    const school = await this.schoolService.findSchoolById(schoolId);
    if (!school[0]) {
      throw new BadRequestException('school does not exist');
    }

    if (!school[0].admins.includes(req.user.id)) {
      throw new ForbiddenException('no permission');
    }

    const feed = await this.schoolService.findSchoolFeed(feedId);
    if (!feed[0]) {
      throw new BadRequestException('feed does not exist');
    }

    await this.schoolService.deleteSchoolFeed(feed[0].id, feed[0].created_at);

    res.status(HttpStatus.NO_CONTENT).end();
  }
}
