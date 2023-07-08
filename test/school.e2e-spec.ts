import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as cookieParser from 'cookie-parser';
import { Item, QueryResponse, getModelToken } from 'nestjs-dynamoose';
import { UsersService } from '../src/users/users.service';
import { User } from '../src/users/interface/user.interface';

const mockRegionModel = {
  query: jest.fn(),
};

const mockSchoolModel = {
  create: jest.fn(),
  query: jest.fn(),
  scan: jest.fn(),
};

const mockFeedModel = {
  create: jest.fn(),
  query: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
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
      .send({ email: 'suj970@naver.com', password: '1234' });

  const getInvalidAdminAuth = async () =>
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'suj9730@naver.com', password: '1234' });

  const getUserAuth = async () =>
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'student@email.com', password: '1234' });

  describe('/ (POST)', () => {
    it('성공적으로 학교 페이지를 생성하는 경우', async () => {
      jest.spyOn(mockRegionModel, 'query').mockImplementationOnce(() => ({
        eq: () => ({
          exec: () => [
            {
              name: '서울특별시',
            },
          ],
        }),
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
        .expect('"create school page successfully"');
    });

    it('지역이 존재하지 않는 경우', async () => {
      jest.spyOn(mockRegionModel, 'query').mockImplementationOnce(() => ({
        eq: () => ({
          exec: () => [],
        }),
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

  describe('/schools/:id/feed (POST)', () => {
    it('성공적으로 피드를 작성하는 경우', async () => {
      jest.spyOn(mockSchoolModel, 'query').mockImplementationOnce(() => ({
        eq: () => ({
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

      const response = await getAdminAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .post('/schools/uuid/feeds')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .send({
          subject: '제목',
          content: '내용',
        })
        .expect(201)
        .expect('"create school feed successfully"');
    });

    it('작성하려는 학교 존재하지 않는 경우', async () => {
      jest.spyOn(mockSchoolModel, 'query').mockImplementationOnce(() => ({
        eq: () => ({
          exec: () => [],
        }),
      }));

      const response = await getAdminAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .post('/schools/uuid/feeds')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .send({
          subject: '제목',
          content: '내용',
        })
        .expect(400)
        .expect({
          statusCode: 400,
          message: 'school does not exist',
          error: 'Bad Request',
        });
    });

    it('id를 가진 회사의 관리자가 아닌 경우', async () => {
      jest.spyOn(mockSchoolModel, 'query').mockImplementationOnce(() => ({
        eq: () => ({
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

      const response = await getInvalidAdminAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .post('/schools/uuid/feeds')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .send({
          subject: '제목',
          content: '내용',
        })
        .expect(403)
        .expect({
          statusCode: 403,
          message: 'no permission',
          error: 'Forbidden',
        });
    });

    it('유저의 권한이 부족한 경우 ', async () => {
      const response = await getUserAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .post('/schools/uuid/feeds')
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

  describe('/schools/:schoolId/feeds/:feedId (DELETE)', () => {
    it('성공적으로 피드를 삭제하는 경우', async () => {
      jest.spyOn(mockSchoolModel, 'query').mockImplementationOnce(() => ({
        eq: () => ({
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

      jest.spyOn(mockFeedModel, 'query').mockImplementationOnce(() => ({
        eq: () => ({
          exec: () => [
            {
              id: 'c24788ba-62bb-49c5-a08f-2a9f82a0a44c',
              created_at: 1688736027197,
              content: '내용',
              school: {
                name: '행복고등학교',
                id: '82d9823c-6f22-4c33-9f8c-f1c5ffce171b',
              },
              subject: '제목',
            },
          ],
        }),
      }));

      const response = await getAdminAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .delete('/schools/uuid/feeds/uuid2')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .expect(204);
    });

    it('학교가 존재하지 않는 경우', async () => {
      jest.spyOn(mockSchoolModel, 'query').mockImplementationOnce(() => ({
        eq: () => ({
          exec: () => [],
        }),
      }));

      const response = await getAdminAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .delete('/schools/uuid/feeds/uuid2')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .expect(400)
        .expect({
          statusCode: 400,
          message: 'school does not exist',
          error: 'Bad Request',
        });
    });

    it('id를 가진 회사의 관리자가 아닌 경우 ', async () => {
      jest.spyOn(mockSchoolModel, 'query').mockImplementationOnce(() => ({
        eq: () => ({
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

      const response = await getInvalidAdminAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .delete('/schools/uuid/feeds/uuid2')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .expect(403)
        .expect({
          statusCode: 403,
          message: 'no permission',
          error: 'Forbidden',
        });
    });

    it('삭제하려는 피드가 존재하지 않는 경우', async () => {
      jest.spyOn(mockSchoolModel, 'query').mockImplementationOnce(() => ({
        eq: () => ({
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

      jest.spyOn(mockFeedModel, 'query').mockImplementationOnce(() => ({
        eq: () => ({
          exec: () => [],
        }),
      }));

      const response = await getAdminAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .delete('/schools/uuid/feeds/uuid2')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .expect(400)
        .expect({
          statusCode: 400,
          message: 'feed does not exist',
          error: 'Bad Request',
        });
    });

    it('유저의 권한이 부족한 경우 ', async () => {
      const response = await getUserAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .delete('/schools/uuid/feeds/uuid2')
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

  describe('/schools/:schoolId/feeds/:feedId (PATCH)', () => {
    it('성공적으로 피드를 수정하는 경우', async () => {
      jest.spyOn(mockSchoolModel, 'query').mockImplementationOnce(() => ({
        eq: () => ({
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

      jest.spyOn(mockFeedModel, 'query').mockImplementationOnce(() => ({
        eq: () => ({
          exec: () => [
            {
              id: 'c24788ba-62bb-49c5-a08f-2a9f82a0a44c',
              created_at: 1688736027197,
              content: '내용',
              school: {
                name: '행복고등학교',
                id: '82d9823c-6f22-4c33-9f8c-f1c5ffce171b',
              },
              subject: '제목',
            },
          ],
        }),
      }));

      const response = await getAdminAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .patch('/schools/uuid/feeds/uuid2')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .expect(204);
    });

    it('학교가 존재하지 않는 경우', async () => {
      jest.spyOn(mockSchoolModel, 'query').mockImplementationOnce(() => ({
        eq: () => ({
          exec: () => [],
        }),
      }));

      const response = await getAdminAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .patch('/schools/uuid/feeds/uuid2')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .expect(400)
        .expect({
          statusCode: 400,
          message: 'school does not exist',
          error: 'Bad Request',
        });
    });

    it('id를 가진 회사의 관리자가 아닌 경우 ', async () => {
      jest.spyOn(mockSchoolModel, 'query').mockImplementationOnce(() => ({
        eq: () => ({
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

      const response = await getInvalidAdminAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .patch('/schools/uuid/feeds/uuid2')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .expect(403)
        .expect({
          statusCode: 403,
          message: 'no permission',
          error: 'Forbidden',
        });
    });

    it('수정하려는 피드가 존재하지 않는 경우', async () => {
      jest.spyOn(mockSchoolModel, 'query').mockImplementationOnce(() => ({
        eq: () => ({
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

      jest.spyOn(mockFeedModel, 'query').mockImplementationOnce(() => ({
        eq: () => ({
          exec: () => [],
        }),
      }));

      const response = await getAdminAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .patch('/schools/uuid/feeds/uuid2')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .expect(400)
        .expect({
          statusCode: 400,
          message: 'feed does not exist',
          error: 'Bad Request',
        });
    });
    it('유저의 권한이 부족한 경우 ', async () => {
      const response = await getUserAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .patch('/schools/uuid/feeds/uuid2')
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
      jest.spyOn(mockSchoolModel, 'query').mockImplementationOnce(() => ({
        eq: () => ({
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

      jest.spyOn(UsersService.prototype, 'findUserById').mockResolvedValue([
        {
          email: 'test1234@naver.com',
          id: 'uuid',
          role: 200,
          subscribe_schools: ['82d9823c-6f22-4c33-9f8c-f1c5ffce171b'],
        },
      ] as QueryResponse<Item<User>>);
      jest
        .spyOn(UsersService.prototype, 'subscribeSchoolPage')
        .mockResolvedValue({
          email: 'test1234@naver.com',
          id: 'uuid',
          role: 200,
          subscribe_schools: ['82d9823c-6f22-4c33-9f8c-f1c5ffce171b', 'uuid'],
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
          subscribe_schools: ['82d9823c-6f22-4c33-9f8c-f1c5ffce171b', 'uuid'],
        });
    });

    it('schoolId를 가진 학교가 존재하지 않는 경우', async () => {
      jest.spyOn(mockSchoolModel, 'query').mockImplementationOnce(() => ({
        eq: () => ({
          exec: () => [],
        }),
      }));

      const response = await getUserAuth();
      const { header } = response;

      return request(app.getHttpServer())
        .patch('/schools/uuid/subscribe')
        .set('Accept', 'application/json')
        .set('Cookie', [...header['set-cookie']])
        .expect(400)
        .expect({
          message: 'schoold does not exist',
          error: 'Bad Request',
          statusCode: 400,
        });
    });
    it('유저가 이미 schoolId를 가진 학교 페이지를 구독한 경우', async () => {
      jest.spyOn(mockSchoolModel, 'query').mockImplementationOnce(() => ({
        eq: () => ({
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

      jest.spyOn(UsersService.prototype, 'findUserById').mockResolvedValue([
        {
          email: 'test1234@naver.com',
          id: 'uuid',
          role: 200,
          subscribe_schools: ['82d9823c-6f22-4c33-9f8c-f1c5ffce171b', 'uuid'],
        },
      ] as QueryResponse<Item<User>>);

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
      jest.spyOn(UsersService.prototype, 'findUserById').mockResolvedValue([
        {
          email: 'test1234@naver.com',
          id: 'uuid',
          role: 200,
          subscribe_schools: ['82d9823c-6f22-4c33-9f8c-f1c5ffce171b'],
        },
      ] as QueryResponse<Item<User>>);

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
});
