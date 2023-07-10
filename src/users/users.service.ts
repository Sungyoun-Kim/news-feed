import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { InjectModel, Item, Model } from 'nestjs-dynamoose';
import { User, UserKey } from './interface/user.interface';
import { SignUpUserDto } from './dto/users.dto';
import { v4 } from 'uuid';
import { AuthService } from '../auth/auth.service';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel('Users')
    private userModel: Model<User, UserKey>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async signUpUser(signUpUserDto: SignUpUserDto) {
    signUpUserDto.password = await this.authService.hashPassword(
      signUpUserDto.password,
    );

    signUpUserDto.id = v4();

    try {
      return await this.userModel.create(signUpUserDto);
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
        { $ADD: { subscribe_schools: [schoolId] } },
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
        (id) => id !== schoolId,
      );
      const result = await this.userModel.update(
        { id: user.id, email: user.email },
        { $SET: { subscribe_schools: deletedSchoolArr } },
      );
      const { password, ...rest } = result;
      return rest;
    } catch (e) {
      console.error('쿼리를 시도하던 중 에러가 발생했습니다');
      throw e;
    }
  }
}
