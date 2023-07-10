import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { School, SchoolKey } from './interface/schools.interface';
import { Region, RegionKey } from './interface/regions.interface';
import { CreateSchoolPageDto } from './dto/schools.dto';

import { Feed, FeedKey } from '../feeds/interface/feeds.interface';

@Injectable()
export class SchoolsService {
  constructor(
    @InjectModel('Schools')
    private readonly schoolModel: Model<School, SchoolKey>,
    @InjectModel('Regions')
    private readonly regionModel: Model<Region, RegionKey>,
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
}
