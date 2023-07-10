import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { InjectModel, Model, TransactionSupport } from 'nestjs-dynamoose';
import { User, UserKey } from './interface/user.interface';
import { SignUpUserDto } from './dto/users.dto';
import { AuthService } from '../auth/auth.service';
import { Feed, FeedKey } from 'src/feeds/interface/feeds.interface';
import {
  UnsubscribedFeed,
  UnsubscribedFeedKey,
} from 'src/feeds/interface/unsubscribed-feeds.interface';
@Injectable()
export class UsersService extends TransactionSupport {
  constructor(
    @InjectModel('Users')
    private readonly userModel: Model<User, UserKey>,
    @InjectModel('Feeds')
    private readonly feedModel: Model<Feed, FeedKey>,
    @InjectModel('UnsubscribedFeeds')
    private readonly unsubscribedFeedModel: Model<
      UnsubscribedFeed,
      UnsubscribedFeedKey
    >,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {
    super();
  }

  async signUpUser(signUpUserDto: SignUpUserDto) {
    signUpUserDto.password = await this.authService.hashPassword(
      signUpUserDto.password,
    );
    try {
      const result = await this.userModel.create(signUpUserDto);
      const { password, ...rest } = result;
      return rest;
    } catch (e) {
      console.error('쿼리를 시도하던 중 에러가 발생했습니다');
      throw e;
    }
  }

  async findUserByEmail(email: string) {
    if (!email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)) {
      throw new BadRequestException('email is invalid');
    }

    try {
      const result = await this.userModel.scan('email').eq(email).exec();

      return result;
    } catch (e) {
      console.error('쿼리를 시도하던 중 에러가 발생했습니다');
      throw e;
    }
  }
  async findUserByIdAndEmail(id: string, email: string) {
    try {
      const result = await this.userModel.get({ id, email });

      return result;
    } catch (e) {
      console.error('쿼리를 시도하던 중 에러가 발생했습니다');
      throw e;
    }
  }

  async subscribeSchoolPage(userId: string, email: string, schoolId: string) {
    try {
      const result = await this.userModel.update(
        { id: userId, email: email },
        {
          $ADD: {
            subscribe_schools: [{ id: schoolId, subscribe_at: Date.now() }],
          },
        },
      );
      const { password, ...rest } = result;
      return rest;
    } catch (e) {
      console.error('쿼리를 시도하던 중 에러가 발생했습니다');
      throw e;
    }
  }

  /*
   *https://github.com/dynamoose/dynamoose/issues/398
   *$ADD가 set이나 list에 요소를 추가하는 것 처럼
   *요소를 제거하는 것이 지원되지 않는 것 같습니다
   */
  async unsubscribeSchoolPage(user: User, schoolId: string) {
    try {
      const deletedSchoolArr = user.subscribe_schools.filter(
        (school) => school.id !== schoolId,
      );
      const unscribeSchoolInfo = user.subscribe_schools.find(
        (school) => school.id == schoolId,
      );

      const unsubscribedFeeds = await this.feedModel
        .scan('school.id')
        .eq(schoolId)
        .where('created_at')
        .between(unscribeSchoolInfo.subscribe_at, Date.now())
        .exec();

      unsubscribedFeeds.map((feed) => {
        feed.created_at = feed.created_at.valueOf();
        return feed;
      });

      await this.transaction([
        this.unsubscribedFeedModel.transaction.create({
          user_id: user.id,
          feeds: JSON.parse(JSON.stringify(unsubscribedFeeds)),
        }),

        this.userModel.transaction.update(
          { id: user.id, email: user.email },
          { $SET: { subscribe_schools: deletedSchoolArr } },
        ),
      ]);
    } catch (e) {
      console.error('쿼리를 시도하던 중 에러가 발생했습니다');
      throw e;
    }
  }
}
