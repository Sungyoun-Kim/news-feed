import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RoleLevel, RoleGuard } from '../auth/guard/role.guard';
import { Role } from '../users/schema/users.schema';
import {
  CreateSchoolFeedDto,
  CreateSchooFeedResponseDto,
  UpdateSchoolFeedDto,
  GetSchoolFeedResponseDto,
} from './dto/feeds.dto';
import { Request, Response } from 'express';
import { FeedsService } from './feeds.service';
import { SchoolsService } from '../schools/schools.service';
import { UsersService } from '../users/users.service';
import { Feed } from './interface/feeds.interface';

@ApiTags('Feed')
@Controller()
export class FeedsController {
  constructor(
    private readonly feedService: FeedsService,
    private readonly schoolService: SchoolsService,
    private readonly userService: UsersService,
  ) {}

  @ApiOperation({
    summary: '학교 페이지에 피드 생성',
    description: '- 학교 관리자는 학교 페이지 내에 소식을 작성할 수 있다\n',
  })
  @ApiParam({
    name: 'schoolId',
    description: '피드를 생성하려는 학교의 id',
    required: true,
  })
  @ApiBody({
    description: '- 학교 페이지의 피드 생성 시 필요한 데이터',
    type: CreateSchoolFeedDto,
  })
  @ApiCreatedResponse({
    description: '- 학교 페이지 내에 피드 생성 성공 ',
    type: CreateSchooFeedResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      '- schoolId를 가진 학교가 존재하지 않는 경우 \n' +
      '- 올바르지 못한 값이 전달된 경우',
  })
  @ApiUnauthorizedResponse({
    description: '- 요청이 인가되지 않은 경우',
  })
  @ApiForbiddenResponse({
    description:
      '- 피드 생성을 시도한 유저가 schoolId를 가진 학교의 관리자가 아닌 경우\n' +
      '- 권한이 부족한 경우',
  })
  @RoleLevel(Role.admin)
  @UseGuards(RoleGuard)
  @Post('schools/:schoolId/feeds')
  async createSchoolFeed(
    @Req() req: Request,
    @Param('schoolId') schoolId: string,
    @Body() createSchoolFeedDto: CreateSchoolFeedDto,
    @Res() res: Response,
  ) {
    const school = await this.schoolService.findSchoolById(schoolId);
    if (!school) {
      throw new BadRequestException('school does not exist');
    }
    if (!school.admins.includes(req.user.id)) {
      throw new ForbiddenException('no permission');
    }
    createSchoolFeedDto.school = school;
    const result = await this.feedService.createSchoolFeed(createSchoolFeedDto);

    res.status(HttpStatus.CREATED).json(result);
  }

  @ApiOperation({
    summary: '학교 페이지에 피드 삭제',
    description:
      '- 학교 관리자는 학교 페이지 내에 작성된 소식을 삭제할 수 있다\n',
  })
  @ApiParam({
    name: 'schoolId',
    description: '피드를 삭제하려는 학교의 id',
    required: true,
  })
  @ApiParam({
    name: 'feedId',
    description: '삭제하려는 피드의 id',
    required: true,
  })
  @ApiNoContentResponse({
    description: '- 학교 페이지 내에 피드 삭제 성공 ',
  })
  @ApiBadRequestResponse({
    description:
      '- schoolId를 가진 학교가 존재하지 않는 경우 \n' +
      '- feedId를 가진 피드가 존재하지 않는 경우 \n' +
      '- 올바르지 못한 값이 전달된 경우',
  })
  @ApiUnauthorizedResponse({
    description: '- 요청이 인가되지 않은 경우',
  })
  @ApiForbiddenResponse({
    description:
      '- 피드 삭제를 시도한 유저가 schoolId를 가진 학교의 관리자가 아닌 경우\n' +
      '- 권한이 부족한 경우',
  })
  @RoleLevel(Role.admin)
  @UseGuards(RoleGuard)
  @Delete('schools/:schoolId/feeds/:feedId')
  async deleteSchoolFeed(
    @Req() req: Request,
    @Param('schoolId') schoolId: string,
    @Param('feedId') feedId: string,
    @Res() res: Response,
  ) {
    const school = await this.schoolService.findSchoolById(schoolId);
    if (!school) {
      throw new BadRequestException('school does not exist');
    }

    if (!school.admins.includes(req.user.id)) {
      throw new ForbiddenException('no permission');
    }

    const feed = await this.feedService.findSchoolFeed(feedId);
    if (!feed[0]) {
      throw new BadRequestException('feed does not exist');
    }

    await this.feedService.deleteSchoolFeed(feed[0].id, feed[0].created_at);

    res.status(HttpStatus.NO_CONTENT).end();
  }

  @ApiOperation({
    summary: '학교 페이지에 피드 수정',
    description:
      '- 학교 관리자는 학교 페이지 내에 작성된 소식을 수정할 수 있다\n',
  })
  @ApiParam({
    name: 'schoolId',
    description: '피드를 수정하려는 학교의 id',
    required: true,
  })
  @ApiParam({
    name: 'feedId',
    description: '수정하려는 피드의 id',
    required: true,
  })
  @ApiBody({
    description: '수정할 내용에 대한 데이터',
    type: UpdateSchoolFeedDto,
  })
  @ApiNoContentResponse({
    description: '- 학교 페이지 내에 피드 수정 성공 ',
  })
  @ApiBadRequestResponse({
    description:
      '- schoolId를 가진 학교가 존재하지 않는 경우 \n' +
      '- feedId를 가진 피드가 존재하지 않는 경우 \n' +
      '- 올바르지 못한 값이 전달된 경우',
  })
  @ApiUnauthorizedResponse({
    description: '- 요청이 인가되지 않은 경우',
  })
  @ApiForbiddenResponse({
    description:
      '- 피드 수정을 시도한 유저가 schoolId를 가진 학교의 관리자가 아닌 경우\n' +
      '- 권한이 부족한 경우',
  })
  @RoleLevel(Role.admin)
  @UseGuards(RoleGuard)
  @Patch('schools/:schoolId/feeds/:feedId')
  async updateSchoolFeed(
    @Req() req: Request,
    @Param('schoolId') schoolId: string,
    @Param('feedId') feedId: string,
    @Body() updateSchoolFeedDto: UpdateSchoolFeedDto,
    @Res() res: Response,
  ) {
    const school = await this.schoolService.findSchoolById(schoolId);
    if (!school) {
      throw new BadRequestException('school does not exist');
    }

    if (!school.admins.includes(req.user.id)) {
      throw new ForbiddenException('no permission');
    }

    const feed = await this.feedService.findSchoolFeed(feedId);
    if (!feed[0]) {
      throw new BadRequestException('feed does not exist');
    }

    await this.feedService.updateSchoolFeed(
      feed[0].id,
      feed[0].created_at,
      updateSchoolFeedDto,
    );

    res.status(HttpStatus.NO_CONTENT).end();
  }

  @ApiOperation({
    summary: '학생이 구독한 학교 페이지의 소식을 조회',
    description: '- 학생이  구독한 학교 페이지의 소식을 조회할 수 있다\n',
  })
  @ApiParam({
    name: 'schoolId',
    description: '피드를 조회하려는 학교의 id',
    required: true,
  })
  @ApiOkResponse({
    description: '- 학교 페이지 피드 조회 성공 ',
    type: GetSchoolFeedResponseDto,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description:
      '- schoolId를 가진 학교가 존재하지 않는 경우 \n' +
      '- 올바르지 못한 값이 전달된 경우',
  })
  @ApiForbiddenResponse({
    description:
      '- 유저가 schoolId를 가진 학교 페이지를 구독한 상태가 아닌 경우 \n',
  })
  @ApiUnauthorizedResponse({
    description: '- 요청이 인가되지 않은 경우',
  })
  @RoleLevel(Role.student)
  @UseGuards(RoleGuard)
  @Get('schools/:schoolId/feeds')
  async getSchoolFeed(
    @Req() req: Request,
    @Param('schoolId') schoolId: string,
    @Res() res: Response,
  ) {
    const school = await this.schoolService.findSchoolById(schoolId);
    if (!school) {
      throw new BadRequestException('school does not exist');
    }
    const user = await this.userService.findUserByIdAndEmail(
      req.user.id,
      req.user.email,
    );

    if (
      user &&
      !user.subscribe_schools.find((school) => school.id == schoolId)
    ) {
      throw new ForbiddenException('should subscribe school page');
    }
    const result = await this.feedService.findSchoolFeeds(schoolId);
    res.status(200).json(result);
  }

  @ApiOperation({
    summary: '학생이 구독한 학교 페이지를 모아보기',
    description:
      '- 학생은 구독 중인 학교 소식을 자신의 뉴스피드에서 모아봅니다\n' +
      '- 소식은 최신 순으로 조회됩니다\n' +
      '- 구독하는 시점 이후만 조회 됩니다\n' +
      '- 구독을 취소해도 기존에 조회되던 소식은 조회됩니다',
  })
  @ApiOkResponse({
    description: '- 학교 페이지 피드 조회 성공 ',
    type: GetSchoolFeedResponseDto,
    isArray: true,
  })
  @ApiUnauthorizedResponse({
    description: '- 요청이 인가되지 않은 경우',
  })
  @RoleLevel(Role.student)
  @UseGuards(RoleGuard)
  @Get('feeds')
  async getUserFeed(@Req() req: Request, @Res() res: Response) {
    const user = await this.userService.findUserByIdAndEmail(
      req.user.id,
      req.user.email,
    );
    let userFeed: Feed[] = [];

    const subscribeFeed = await this.feedService.findSubscribeFeed(
      user.subscribe_schools,
    );
    subscribeFeed.map((feed) => (userFeed = [...userFeed, ...feed]));

    const unsubsribeFeed = await this.feedService.findUnsubScribeFeed(user.id);

    unsubsribeFeed.map((feed) => (userFeed = [...userFeed, ...feed.feeds]));

    userFeed.sort((a, b) => b.created_at - a.created_at);
    res.status(200).json(userFeed);
  }
}
