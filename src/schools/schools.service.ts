import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { School, SchoolKey } from './interface/schools.interface';
import { Region, RegionKey } from './interface/regions.interface';
import { CreateSchoolPageDto } from './dto/schools.dto';
import { v4 } from 'uuid';
import { CreateSchoolFeedDto, UpdateSchoolFeedDto } from './dto/feeds.dto';
import { Feed, FeedKey } from './interface/feeds.interface';

@Injectable()
export class SchoolsService {
  constructor(
    @InjectModel('Schools')
    private readonly schoolModel: Model<School, SchoolKey>,
    @InjectModel('Regions')
    private readonly regionModel: Model<Region, RegionKey>,
    @InjectModel('Feeds')
    private readonly feedModel: Model<Feed, FeedKey>,
  ) {}

  async findRegion(name: string) {
    try {
      const result = await this.regionModel.get({ name });

      return result;
    } catch (e) {
      console.error('쿼리 중 에러가 발생했습니다.');
      throw e;
    }
  }

  async createSchoolPage(
    userId: string,
    createSchoolPageDto: CreateSchoolPageDto,
  ) {
    createSchoolPageDto.id = v4();
    createSchoolPageDto.admins = [userId];
    try {
      const result = await this.schoolModel.create(createSchoolPageDto);
      return result;
    } catch (e) {
      console.error('쿼리 중 에러가 발생했습니다.');
      throw e;
    }
  }

  async findSchoolById(id: string) {
    try {
      const result = await this.schoolModel.get({ id });

      return result;
    } catch (e) {
      console.error('쿼리 중 에러가 발생했습니다.');
      throw e;
    }
  }

  async createSchoolFeed(createSchoolFeedDto: CreateSchoolFeedDto) {
    createSchoolFeedDto.id = v4();

    try {
      const result = await this.feedModel.create(createSchoolFeedDto);
      return result;
    } catch (e) {
      console.error('쿼리 중 에러가 발생했습니다.');
      throw e;
    }
  }

  async findSchoolFeed(id: string) {
    try {
      const result = await this.feedModel.query('id').eq(id).exec();
      return result;
    } catch (e) {
      console.error('쿼리 중 에러가 발생했습니다.');
      throw e;
    }
  }
  async deleteSchoolFeed(id: string, createdAt: number) {
    try {
      await this.feedModel.delete({ id, created_at: createdAt.valueOf() });
    } catch (e) {
      console.error('쿼리 중 에러가 발생했습니다.');
      throw e;
    }
  }

  async updateSchoolFeed(
    id: string,
    createdAt: number,
    updateSchoolFeedDto: UpdateSchoolFeedDto,
  ) {
    try {
      await this.feedModel.update(
        { id, created_at: createdAt.valueOf() },
        updateSchoolFeedDto,
      );
    } catch (e) {
      console.error('쿼리 중 에러가 발생했습니다.');
      throw e;
    }
  }

  async findSubscribeSchoolPages(subscribeSchools: string[]) {
    try {
      const result = await this.schoolModel
        .scan('id')
        .in(subscribeSchools)
        .exec();
      return result;
    } catch (e) {
      console.error('쿼리 중 에러가 발생했습니다.');
      throw e;
    }
  }

  async findSchoolFeeds(id: string) {
    try {
      const result = (
        await this.feedModel.scan({ 'school.id': id }).exec()
      ).sort((a, b) => b.created_at - a.created_at);
      return result;
    } catch (e) {
      console.error('쿼리 중 에러가 발생했습니다.');
      throw e;
    }
  }
}
