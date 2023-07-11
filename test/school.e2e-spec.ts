import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as cookieParser from 'cookie-parser';
import { Item, QueryResponse, getModelToken } from 'nestjs-dynamoose';
import { UsersService } from '../src/users/users.service';
import { User } from '../src/users/interface/user.interface';

const mockRegionModel = {
  get: jest.fn(),
};

const mockSchoolModel = {
  create: jest.fn(),
  query: jest.fn(),
  scan: jest.fn(),
  get: jest.fn(),
};

const mockFeedModel = {
  create: jest.fn(),
  query: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
  scan: jest.fn(),
};

describe('school (e2e)', () => {
  let app: INestApplication;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        { provide: getModelToken('Regions'), useValue: mockRegionModel },
        { provide: getModelToken('Schools'), useValue: mockSchoolModel },
        { provide: getModelToken('Feeds'), useValue: mockFeedModel },
      ],
    })
      .overrideProvider(getModelToken('Regions'))
      .useValue(mockRegionModel)
      .overrideProvider(getModelToken('Schools'))
      .useValue(mockSchoolModel)
      .overrideProvider(getModelToken('Feeds'))
      .useValue(mockFeedModel)

      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.enableCors({
      origin: 'http://localhost:3000',
      credentials: true,
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const getAdminAuth = async () =>
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@email.com', password: '1234' });

  const getUserAuth = async () =>
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'student@email.com', password: '1234' });

  describe('/ (POST)', () => {
    it('성공적으로 학교 페이지를 생성하는 경우', async () => {
      jest.spyOn(mockRegionModel, 'get').mockImplementationOnce(() => ({
        name: '서울특별시',
      }));

      jest.spyOn(mockSchoolModel, 'create').mockImplementation(() => ({
        email: 'tes33313t2@email.com',
        role: 300,
        id: '0333feb3-ccee-4ed8-814c-e6130ca2838c',
        subscribe_schools: [],
      }));

      const response = await getAdminAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .post('/schools')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .send({
          name: '성윤고등학교',
          region_name: '서울특별시',
        })
        .expect(201)
        .expect({
          email: 'tes33313t2@email.com',
          role: 300,
          id: '0333feb3-ccee-4ed8-814c-e6130ca2838c',
          subscribe_schools: [],
        });
    });

    it('지역이 존재하지 않는 경우', async () => {
      const response = await getAdminAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .post('/schools')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .send({
          name: '성윤고등학교',
          region_name: '서울특별시',
        })
        .expect(400)
        .expect({
          statusCode: 400,
          message: 'region does not exist',
          error: 'Bad Request',
        });
    });

    it('유저의 권한이 부족한 경우 ', async () => {
      const response = await getUserAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .post('/schools')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .expect(403)
        .expect({
          message: 'insufficient permission',
          error: 'Forbidden',
          statusCode: 403,
        });
    });
  });

  describe('/schools/:schoolId/subscribe', () => {
    it('유저가 성공적으로 구독하는 경우', async () => {
      jest.spyOn(mockSchoolModel, 'get').mockImplementationOnce(() => ({
        region_name: '경상남도',
        id: 'uuid',
        name: '행복고등학교',
        admins: ['b7cba70b-78bc-438e-b08b-0679282c15a0'],
      }));

      jest
        .spyOn(UsersService.prototype, 'findUserByIdAndEmail')
        .mockResolvedValue({
          email: 'test1234@naver.com',
          id: 'uuid',
          role: 200,
          subscribe_schools: [],
        } as Item<User>);

      jest
        .spyOn(UsersService.prototype, 'subscribeSchoolPage')
        .mockResolvedValue({
          email: 'test1234@naver.com',
          id: 'uuid',
          role: 200,
          subscribe_schools: [{ id: 'uuid', subscribe_at: 12345678 }],
        } as Omit<Item<User>, 'password'>);

      const response = await getUserAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .patch('/schools/uuid/subscribe')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .expect(201)
        .expect({
          email: 'test1234@naver.com',
          id: 'uuid',
          role: 200,
          subscribe_schools: [{ id: 'uuid', subscribe_at: 12345678 }],
        });
    });

    it('schoolId를 가진 학교가 존재하지 않는 경우', async () => {
      const response = await getUserAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .patch('/schools/uuid/subscribe')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .expect(400)
        .expect({
          message: 'school does not exist',
          error: 'Bad Request',
          statusCode: 400,
        });
    });
    it('유저가 이미 schoolId를 가진 학교 페이지를 구독한 경우', async () => {
      jest.spyOn(mockSchoolModel, 'get').mockImplementationOnce(() => ({
        region_name: '경상남도',
        id: 'uuid',
        name: '행복고등학교',
        admins: ['b7cba70b-78bc-438e-b08b-0679282c15a0'],
      })),
        jest
          .spyOn(UsersService.prototype, 'findUserByIdAndEmail')
          .mockResolvedValue({
            email: 'test1234@naver.com',
            id: 'uuid',
            role: 200,
            subscribe_schools: [{ id: 'uuid', subscribe_at: 12345678 }],
          } as Item<User>);

      const response = await getUserAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .patch('/schools/uuid/subscribe')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .expect(400)
        .expect({
          message: 'user already subscribe school',
          error: 'Bad Request',
          statusCode: 400,
        });
    });
  });

  describe('/schools/subscribe', () => {
    it('유저가 성공적으로 구독하는 학교 페이지 목록을 조회하는 경우', async () => {
      jest
        .spyOn(UsersService.prototype, 'findUserByIdAndEmail')
        .mockResolvedValue({
          email: 'test1234@naver.com',
          id: 'uuid',
          role: 200,
          subscribe_schools: [{ id: 'uuid', subscribe_at: 12345678 }],
        } as Item<User>);

      jest.spyOn(mockSchoolModel, 'scan').mockImplementationOnce(() => ({
        in: () => ({
          exec: () => [
            {
              region_name: '경상남도',
              id: 'uuid',
              name: '행복고등학교',
              admins: ['b7cba70b-78bc-438e-b08b-0679282c15a0'],
            },
          ],
        }),
      }));
      const response = await getUserAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .get('/schools/subscribe')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .expect(200)
        .expect([
          {
            region_name: '경상남도',
            id: 'uuid',
            name: '행복고등학교',
            admins: ['b7cba70b-78bc-438e-b08b-0679282c15a0'],
          },
        ]);
    });
  });

  describe('/schools/:schoolId/unsubscribe', () => {
    it('유저가 성공적으로 구독을 취소하는 경우', async () => {
      jest.spyOn(mockSchoolModel, 'get').mockImplementationOnce(() => ({
        region_name: '경상남도',
        id: 'uuid',
        name: '행복고등학교',
        admins: ['b7cba70b-78bc-438e-b08b-0679282c15a0'],
      }));

      jest
        .spyOn(UsersService.prototype, 'findUserByIdAndEmail')
        .mockResolvedValue({
          email: 'test1234@naver.com',
          id: 'uuid',
          role: 200,
          subscribe_schools: [{ id: 'uuid', subscribe_at: 12345678 }],
        } as Item<User>);

      jest
        .spyOn(UsersService.prototype, 'unsubscribeSchoolPage')
        .mockResolvedValue();

      const response = await getUserAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .patch('/schools/uuid/unsubscribe')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .expect(201)
        .expect({
          email: 'test1234@naver.com',
          id: 'uuid',
          role: 200,
          subscribe_schools: [{ id: 'uuid', subscribe_at: 12345678 }],
        });
    });

    it('schoolId를 가진 학교가 존재하지 않는 경우', async () => {
      const response = await getUserAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .patch('/schools/uuid/unsubscribe')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .expect(400)
        .expect({
          message: 'school does not exist',
          error: 'Bad Request',
          statusCode: 400,
        });
    });
    it('유저가 이미 schoolId를 가진 학교 페이지를 구독하지 않은 경우', async () => {
      jest.spyOn(mockSchoolModel, 'get').mockImplementationOnce(() => ({
        region_name: '경상남도',
        id: 'uuid',
        name: '행복고등학교',
        admins: ['b7cba70b-78bc-438e-b08b-0679282c15a0'],
      }));

      jest
        .spyOn(UsersService.prototype, 'findUserByIdAndEmail')
        .mockResolvedValue({
          email: 'test1234@naver.com',
          id: 'uuid',
          role: 200,
          subscribe_schools: [],
        } as Item<User>);

      const response = await getUserAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .patch('/schools/uuid/unsubscribe')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .expect(400)
        .expect({
          message: 'user already unsubscribe school',
          error: 'Bad Request',
          statusCode: 400,
        });
    });
  });
});
