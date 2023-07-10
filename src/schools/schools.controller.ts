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
import { SchoolsService } from './schools.service';
import {
  CreateSchoolPageDto,
  FindSubscribeSchoolPagesResponseDto,
} from './dto/schools.dto';
import { Request, Response } from 'express';
import {
  CreateSchoolFeedDto,
  GetSchoolFeedResponseDto,
  UpdateSchoolFeedDto,
} from './dto/feeds.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RoleGuard, RoleLevel } from '../auth/guard/role.guard';
import { Role } from '../users/schema/users.schema';
import { UsersService } from '../users/users.service';

@ApiTags('School')
@Controller('schools')
export class SchoolsController {
  constructor(
    private readonly schoolService: SchoolsService,
    private readonly userService: UsersService,
  ) {}

  @ApiOperation({
    summary: '학교 페이지 생성',
    description:
      '- 학교 관리자는 지역, 학교명으로 학교 페이지를 생성할 수 있다\n',
  })
  @ApiBody({
    description: '- 학교 페이지 생성 시 필요한 데이터',
    type: CreateSchoolPageDto,
  })
  @ApiUnauthorizedResponse({
    description: '- 요청이 인가되지 않은 경우',
  })
  @ApiCreatedResponse({
    description: '- 학교 페이지 생성 성공 ',
  })
  @ApiBadRequestResponse({
    description:
      '- 지역이 존재하지 않는 경우\n' + '- 올바르지 못한 값이 전달된 경우',
  })
  @ApiForbiddenResponse({
    description: '- 권한이 부족한 경우',
  })
  @RoleLevel(Role.admin)
  @UseGuards(RoleGuard)
  @Post()
  async createSchoolPage(
    @Req() req: Request,
    @Body() createSchoolPageDto: CreateSchoolPageDto,
    @Res() res: Response,
  ) {
    const region = await this.schoolService.findRegion(
      createSchoolPageDto.region_name,
    );

    if (!region) {
      throw new BadRequestException('region does not exist');
    }

    const result = await this.schoolService.createSchoolPage(
      req.user.id,
      createSchoolPageDto,
    );

    res.status(HttpStatus.CREATED).json(result);
  }

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
  @Post(':schoolId/feeds')
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
    const result = await this.schoolService.createSchoolFeed(
      createSchoolFeedDto,
    );

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
  @Delete(':schoolId/feeds/:feedId')
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

    const feed = await this.schoolService.findSchoolFeed(feedId);
    if (!feed[0]) {
      throw new BadRequestException('feed does not exist');
    }

    await this.schoolService.deleteSchoolFeed(feed[0].id, feed[0].created_at);

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
  @Patch(':schoolId/feeds/:feedId')
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

    const feed = await this.schoolService.findSchoolFeed(feedId);
    if (!feed[0]) {
      throw new BadRequestException('feed does not exist');
    }

    await this.schoolService.updateSchoolFeed(
      feed[0].id,
      feed[0].created_at,
      updateSchoolFeedDto,
    );

    res.status(HttpStatus.NO_CONTENT).end();
  }

  @ApiOperation({
    summary: '학생이 학교 페이지를 구독',
    description: '- 학생은 학교 페이지를 구독할 수 있다\n',
  })
  @ApiParam({
    name: 'schoolId',
    description: '구독하려는 학교의 id',
    required: true,
  })
  @ApiCreatedResponse({
    description: '- 학교 페이지 구독 성공 ',
  })
  @ApiBadRequestResponse({
    description:
      '- schoolId를 가진 학교가 존재하지 않는 경우 \n' +
      '- 학생이 이미 schoolId를 가진 학교 페이지를 구독을 한 경우 \n' +
      '- 올바르지 못한 값이 전달된 경우',
  })
  @ApiUnauthorizedResponse({
    description: '- 요청이 인가되지 않은 경우',
  })
  @RoleLevel(Role.user)
  @UseGuards(RoleGuard)
  @Patch(':schoolId/subscribe')
  async subscribeSchoolPage(
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

    if (user && user.subscribe_schools.includes(schoolId)) {
      throw new BadRequestException('user already subscribe school');
    }

    const result = await this.userService.subscribeSchoolPage(
      user.id,
      user.email,
      schoolId,
    );

    res.status(201).json(result);
  }

  @ApiOperation({
    summary: '학생이 구독하고 있는 학교 페이지를 조회',
    description: '- 학생이 구독하고 있는 모든 학교 페이지를 조회합니다\n',
  })
  @ApiOkResponse({
    description: '- 학생이 구독하고 있는 모든 학교 페이지를 조회 성공 ',
    type: FindSubscribeSchoolPagesResponseDto,
    isArray: true,
  })
  @ApiUnauthorizedResponse({
    description: '- 요청이 인가되지 않은 경우',
  })
  @RoleLevel(Role.user)
  @UseGuards(RoleGuard)
  @Get('subscribe')
  async findSubscribeSchoolPages(
    @Req() req: Request,

    @Res() res: Response,
  ) {
    const user = await this.userService.findUserByIdAndEmail(
      req.user.id,
      req.user.email,
    );

    if (user.subscribe_schools.length == 0) {
      res.status(HttpStatus.OK).json([]);
    } else {
      const result = await this.schoolService.findSubscribeSchoolPages(
        user.subscribe_schools,
      );
      res.status(HttpStatus.OK).json(result);
    }
  }

  @ApiOperation({
    summary: '학생이 학교 페이지를 구독 취소',
    description: '- 학생은 학교 페이지를 구독을 취소할 수 있다\n',
  })
  @ApiParam({
    name: 'schoolId',
    description: '구독을 취소하려는 학교의 id',
    required: true,
  })
  @ApiCreatedResponse({
    description: '- 학교 페이지 구독 취소 성공 ',
  })
  @ApiBadRequestResponse({
    description:
      '- schoolId를 가진 학교가 존재하지 않는 경우 \n' +
      '- 학생이 이미 schoolId를 가진 학교 페이지를 구독한 상태가 아닌 경우 \n' +
      '- 올바르지 못한 값이 전달된 경우',
  })
  @ApiUnauthorizedResponse({
    description: '- 요청이 인가되지 않은 경우',
  })
  @RoleLevel(Role.user)
  @UseGuards(RoleGuard)
  @Patch(':schoolId/unsubscribe')
  async unsubscribeSchoolPage(
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

    if (user && !user.subscribe_schools.includes(school.id)) {
      throw new BadRequestException('user already unsubscribe school');
    }

    const result = await this.userService.unsubscribeSchoolPage(
      user,
      school.id,
    );

    res.status(201).json(result);
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
  @Get(':schoolId/feeds')
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

    if (user && !user.subscribe_schools.includes(schoolId)) {
      throw new ForbiddenException('should subscribe school page');
    }
    const result = await this.schoolService.findSchoolFeeds(schoolId);
    res.status(200).json(result);
  }
}
