import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { Feed, FeedKey } from './interface/feeds.interface';
import { CreateSchoolFeedDto, UpdateSchoolFeedDto } from './dto/feeds.dto';

@Injectable()
export class FeedsService {
  constructor(
    @InjectModel('Feeds') private readonly feedModel: Model<Feed, FeedKey>,
  ) {}

  async createSchoolFeed(createSchoolFeedDto: CreateSchoolFeedDto) {
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
