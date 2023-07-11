import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { Feed, FeedKey } from './interface/feeds.interface';
import { CreateSchoolFeedDto, UpdateSchoolFeedDto } from './dto/feeds.dto';
import {
  UnsubscribedFeed,
  UnsubscribedFeedKey,
} from './interface/unsubscribed-feeds.interface';

@Injectable()
export class FeedsService {
  constructor(
    @InjectModel('Feeds') private readonly feedModel: Model<Feed, FeedKey>,
    @InjectModel('UnsubscribedFeeds')
    private readonly unsubscribedFeedModel: Model<
      UnsubscribedFeed,
      UnsubscribedFeedKey
    >,
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

  async findSubscribeFeed(
    subscribeSchools: { id: String; subscribe_at: Number }[],
  ) {
    try {
      const result = Promise.all(
        subscribeSchools.map(
          async (school) =>
            await this.feedModel
              .scan({ 'school.id': school.id })
              .where('created_at')
              .between(school.subscribe_at, Date.now())
              .exec(),
        ),
      );
      return result;
    } catch (e) {
      console.error('쿼리 중 에러가 발생했습니다.');
      throw e;
    }
  }

  async findUnsubScribeFeed(userId: string) {
    try {
      const result = await this.unsubscribedFeedModel
        .query('user_id')
        .eq(userId)
        .exec();
      return result;
    } catch (e) {
      console.error('쿼리 중 에러가 발생했습니다.');
      throw e;
    }
  }
}
