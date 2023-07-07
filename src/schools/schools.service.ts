import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { School, SchoolKey } from './interface/schools.interface';
import { Region, RegionKey } from './interface/regions.interface';
import { CreateSchoolPageDto } from './dto/schools.dto';
import { v4 } from 'uuid';
import { CreateSchoolFeedDto } from './dto/feeds.dto';
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
      const result = await this.regionModel.query('name').eq(name).exec();

      return result;
    } catch (e) {
      console.error('쿼리 중 에러가 발생했습니다.');
      throw e;
    }
  }

  async createSchoolPage(
    user_id: string,
    createSchoolPageDto: CreateSchoolPageDto,
  ) {
    createSchoolPageDto.id = v4();
    createSchoolPageDto.admins = [user_id];
    try {
      await this.schoolModel.create(createSchoolPageDto);
    } catch (e) {
      console.error('쿼리 중 에러가 발생했습니다.');
      throw e;
    }
  }

  async findSchoolById(id: string) {
    try {
      const result = await this.schoolModel.query('id').eq(id).exec();
      return result;
    } catch (e) {
      console.error('쿼리 중 에러가 발생했습니다.');
      throw e;
    }
  }

  async createSchoolFeed(createSchoolFeedDto: CreateSchoolFeedDto) {
    createSchoolFeedDto.id = v4();

    try {
      await this.feedModel.create(createSchoolFeedDto);
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
  async deleteSchoolFeed(id: string, created_at: number) {
    try {
      await this.feedModel.delete({ id, created_at: created_at.valueOf() });
    } catch (e) {
      console.error('쿼리 중 에러가 발생했습니다.');
      throw e;
    }
  }
}
